<template>
  <div class="posts p-0">
    <div class="flex justify-between items-center mb-12 border-b border-gray-100 pb-8">
      <h1 class="text-3xl font-light m-0">Posts</h1>
      <div class="flex gap-4 items-center">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search posts..."
          @input="handleSearch"
          @keyup.enter="handleSearchImmediate"
          class="border border-b border-gray-300 px-2 py-1 text-sm w-48 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-10"
        />
        <router-link v-if="isAuthenticated" to="/create" class="text-gray-500 text-xs uppercase tracking-wide border-b border-transparent transition-all hover:border-gray-400 hover:text-gray-900">Create</router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16 text-gray-500">
      Loading...
    </div>

    <div v-else-if="posts.length === 0" class="text-center py-16">
      <p class="text-gray-500 mb-8">
        {{ searchQuery ? `No posts found for "${searchQuery}"` : 'No posts found.' }}
      </p>
      <router-link v-if="isAuthenticated && !searchQuery" to="/create" class="text-gray-900 text-xs uppercase tracking-wide border-b border-gray-900">Create first post</router-link>
      <div 
        v-else-if="searchQuery" 
        @click="searchQuery = ''; handleSearchImmediate()" 
        class="text-gray-800 text-sm hover:text-gray-600 transition-colors border-none cursor-pointer"
      >
        Clear Search
      </div>
    </div>

    <div v-else class="list-none p-0">
      <article v-for="post in posts" :key="post.id" class="py-8 border-b border-gray-100 last:border-b-0">
        <div class="flex gap-4 mb-2 text-xs text-gray-400 uppercase tracking-wide">
          <time>{{ formatDate(post.created_at) }}</time>
          <span v-if="post.tag">{{ post.tag }}</span>
        </div>
        <h2 class="text-2xl font-light my-2 leading-tight">
          <router-link :to="`/posts/${post.slug || post.id}`" class="text-gray-900 no-underline hover:underline">
            {{ post.title }}
          </router-link>
        </h2>
        <p class="text-gray-500 m-0">{{ getExcerpt(post.content) }}</p>
      </article>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center gap-8 mt-12 pt-8 border-t border-gray-100">
      <button @click="previousPage" :disabled="currentPage === 1" class="bg-none border-none text-gray-500 text-xs uppercase tracking-wide cursor-pointer p-0 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">Previous</button>
      <span class="text-gray-500 text-xs">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="bg-none border-none text-gray-500 text-xs uppercase tracking-wide cursor-pointer p-0 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { postService } from '../services/posts.js'
import { authService } from '../services/auth.js'

export default {
  name: 'Posts',
  setup() {
    const posts = ref([])
    const loading = ref(true)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalPosts = ref(0)
    const searchQuery = ref('')
    const isAuthenticated = computed(() => authService.isAuthenticated())

    const totalPages = computed(() => {
      return Math.ceil(totalPosts.value / pageSize.value)
    })

    const visiblePages = computed(() => {
      const delta = 2
      const range = []
      const rangeWithDots = []
      let l

      for (let i = 1; i <= totalPages.value; i++) {
        if (i === 1 || i === totalPages.value || (i >= currentPage.value - delta && i <= currentPage.value + delta)) {
          range.push(i)
        }
      }

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1)
          } else if (i - l !== 1) {
            rangeWithDots.push('...')
          }
        }
        rangeWithDots.push(i)
        l = i
      })

      return rangeWithDots
    })

    // Debounce timer for search
    let searchTimeout = null

    const fetchPosts = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value,
          limit: pageSize.value
        }
        
        if (searchQuery.value.trim()) {
          params.q = searchQuery.value
        }

        const response = await postService.getPosts(params)
        posts.value = response.posts || []
        totalPosts.value = response.total || 0
      } catch (err) {
        console.error('Failed to fetch posts:', err)
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      
      // Set new timeout to debounce search
      searchTimeout = setTimeout(() => {
        currentPage.value = 1
        fetchPosts()
      }, 300) // 300ms delay
    }

    // Immediate search for Enter key
    const handleSearchImmediate = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      currentPage.value = 1
      fetchPosts()
    }

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
        fetchPosts()
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
        fetchPosts()
      }
    }

    const goToPage = (page) => {
      if (page !== '...' && page !== currentPage.value) {
        currentPage.value = page
        fetchPosts()
      }
    }

    const getExcerpt = (content) => {
      if (!content) return ''
      const plainText = content.replace(/<[^>]*>/g, '')
      return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString()
    }

    onMounted(fetchPosts)

    return {
      posts,
      loading,
      currentPage,
      totalPages,
      searchQuery,
      isAuthenticated,
      handleSearch,
      handleSearchImmediate,
      previousPage,
      nextPage,
      getExcerpt,
      formatDate
    }
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  .header {
    @apply flex-col gap-4 items-start;
  }
  
  .actions {
    @apply w-full justify-between;
  }
  
  .actions input {
    @apply flex-1;
  }
}
</style>