<template>
  <div class="posts">
    <div class="header">
      <h1>Posts</h1>
      <div class="actions">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          @input="handleSearch"
        />
        <router-link v-if="isAuthenticated" to="/create">Create</router-link>
      </div>
    </div>

    <div v-if="loading" class="loading">
      Loading...
    </div>

    <div v-else-if="posts.length === 0" class="empty">
      <p>No posts found.</p>
      <router-link v-if="isAuthenticated && !searchQuery" to="/create">Create first post</router-link>
    </div>

    <div v-else class="posts-list">
      <article v-for="post in posts" :key="post.id" class="post">
        <div class="post-meta">
          <time>{{ formatDate(post.created_at) }}</time>
          <span v-if="post.tag">{{ post.tag }}</span>
        </div>
        <h2>
          <router-link :to="`/posts/${post.slug || post.id}`">
            {{ post.title }}
          </router-link>
        </h2>
        <p>{{ getExcerpt(post.content) }}</p>
      </article>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
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
      previousPage,
      nextPage,
      getExcerpt,
      formatDate
    }
  }
}
</script>

<style scoped>
.posts {
  padding: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 300;
  margin: 0;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.actions input {
  border: none;
  border-bottom: 1px solid #e0e0e0;
  padding: 4px 0;
  font-size: 0.875rem;
  width: 200px;
}

.actions input:focus {
  outline: none;
  border-bottom-color: #999;
}

.actions a {
  text-decoration: none;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;
}

.actions a:hover {
  border-bottom-color: #999;
  color: #333;
}

.loading {
  text-align: center;
  padding: 4rem 0;
  color: #666;
}

.empty {
  text-align: center;
  padding: 4rem 0;
}

.empty p {
  color: #666;
  margin-bottom: 2rem;
}

.empty a {
  text-decoration: none;
  color: #1a1a1a;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #1a1a1a;
}

.posts-list {
  list-style: none;
  padding: 0;
}

.post {
  padding: 2rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.post:last-child {
  border-bottom: none;
}

.post-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.post h2 {
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0.5rem 0;
  line-height: 1.2;
}

.post h2 a {
  text-decoration: none;
  color: #333;
}

.post h2 a:hover {
  text-decoration: underline;
}

.post p {
  color: #666;
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #f0f0f0;
}

.pagination button {
  background: none;
  border: none;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  padding: 0;
}

.pagination button:hover:not(:disabled) {
  color: #333;
}

.pagination button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination span {
  color: #666;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .actions input {
    flex: 1;
  }
}
</style>