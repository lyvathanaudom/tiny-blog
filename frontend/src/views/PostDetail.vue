<template>
  <div class="max-w-5xl mx-auto">
    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading post...
    </div>

    <div v-else-if="error" class="text-center py-12 text-red-600">
      {{ error }}
    </div>

    <article v-else-if="post" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <header class="p-8 pb-4 border-b border-gray-100">
        <h1 class="text-4xl font-bold text-gray-900 mb-4 leading-tight">{{ post.title }}</h1>
        <div class="flex items-center gap-4 text-gray-500 text-sm">
          <time :datetime="post.created_at">{{ formatDate(post.created_at) }}</time>
          <span v-if="post.tag" class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{{ post.tag }}</span>
        </div>
      </header>

      <div v-if="post.cover" class="w-full h-96 overflow-hidden">
        <img :src="post.cover" :alt="post.title" class="w-full h-full object-cover" />
      </div>

      <div class="p-8 leading-relaxed text-gray-700 prose prose-lg max-w-none" v-html="post.content"></div>

      <footer class="px-8 py-4 border-t border-gray-100 flex justify-between items-center flex-wrap gap-4">
        <router-link to="/posts" class="px-4 py-2 bg-gray-800 text-white rounded-sm font-medium hover:bg-gray-600 transition-colors no-underline">
          ← Back to Posts
        </router-link>
        <div v-if="isAuthenticated" class="flex gap-2">
          <router-link :to="`/edit/${post.id}`" class="px-4 py-2 bg-gray-800 text-white rounded-sm font-medium hover:bg-gray-600 transition-colors no-underline">
            Edit
          </router-link>
          <button @click="confirmDelete" class="px-4 py-2 bg-indigo-500 text-white rounded-sm font-medium hover:bg-red-600 transition-colors border-none cursor-pointer">
            Delete
          </button>
        </div>
      </footer>
    </article>

    <div v-else class="text-center py-12 text-gray-500">
      <h2 class="text-2xl font-light mb-4">Post not found</h2>
      <router-link to="/posts" class="px-4 py-2 bg-gray-800 text-white rounded-sm font-medium hover:bg-gray-600 transition-colors no-underline">
        Back to Posts
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postService } from '../services/posts.js'
import { authService } from '../services/auth.js'

export default {
  name: 'PostDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const post = ref(null)
    const loading = ref(true)
    const error = ref('')
    const isAuthenticated = computed(() => authService.isAuthenticated())

    const fetchPost = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const idOrSlug = route.params.idOrSlug
        post.value = await postService.getPost(idOrSlug)
      } catch (err) {
        if (err.response?.status === 404) {
          error.value = 'Post not found'
        } else {
          error.value = 'Failed to load post'
        }
        console.error('Failed to fetch post:', err)
      } finally {
        loading.value = false
      }
    }

    const confirmDelete = async () => {
      if (confirm('Are you sure you want to delete this post?')) {
        try {
          await postService.deletePost(post.value.id)
          router.push('/posts')
        } catch (err) {
          console.error('Failed to delete post:', err)
          alert('Failed to delete post')
        }
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(fetchPost)

    return {
      post,
      loading,
      error,
      isAuthenticated,
      confirmDelete,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Using Tailwind classes in template, no custom CSS needed */

/* Override prose styles to match our design */
:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4),
:deep(.prose h5),
:deep(.prose h6) {
  color: #1f2937;
  font-weight: 600;
}

:deep(.prose h1) { font-size: 2rem; }
:deep(.prose h2) { font-size: 1.5rem; }
:deep(.prose h3) { font-size: 1.25rem; }

:deep(.prose blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  font-style: italic;
  color: #6b7280;
}

:deep(.prose code) {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}

:deep(.prose pre) {
  background: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

:deep(.prose pre code) {
  background: none;
  padding: 0;
  color: inherit;
}
</style>