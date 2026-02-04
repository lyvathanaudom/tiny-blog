<template>
  <div class="post-detail">
    <div v-if="loading" class="loading">
      Loading post...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <article v-else-if="post" class="post-article">
      <header class="post-header">
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-meta">
          <time :datetime="post.created_at">{{ formatDate(post.created_at) }}</time>
          <span v-if="post.tag" class="post-tag">{{ post.tag }}</span>
        </div>
      </header>

      <div v-if="post.cover" class="post-cover">
        <img :src="post.cover" :alt="post.title" />
      </div>

      <div class="post-content" v-html="post.content"></div>

      <footer class="post-actions">
        <router-link to="/posts" class="btn btn-secondary">
          ← Back to Posts
        </router-link>
        <div v-if="isAuthenticated" class="action-buttons">
          <router-link :to="`/edit/${post.id}`" class="btn btn-primary">
            Edit
          </router-link>
          <button @click="confirmDelete" class="btn btn-danger">
            Delete
          </button>
        </div>
      </footer>
    </article>

    <div v-else class="not-found">
      <h2>Post not found</h2>
      <router-link to="/posts" class="btn btn-primary">
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
.post-detail {
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.error, .not-found {
  text-align: center;
  padding: 3rem;
  color: #dc2626;
}

.not-found {
  color: #6b7280;
}

.post-article {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.post-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.post-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.post-tag {
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.post-cover {
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  padding: 2rem;
  line-height: 1.8;
  color: #374151;
}

.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3),
.post-content :deep(h4),
.post-content :deep(h5),
.post-content :deep(h6) {
  margin: 1.5rem 0 1rem;
  color: #1f2937;
  font-weight: 600;
}

.post-content :deep(h1) { font-size: 2rem; }
.post-content :deep(h2) { font-size: 1.5rem; }
.post-content :deep(h3) { font-size: 1.25rem; }

.post-content :deep(p) {
  margin-bottom: 1rem;
}

.post-content :deep(ul),
.post-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.post-content :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
}

.post-content :deep(code) {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.post-content :deep(pre) {
  background: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.post-content :deep(pre code) {
  background: none;
  padding: 0;
}

.post-actions {
  padding: 1rem 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  display: inline-block;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .post-title {
    font-size: 2rem;
  }
  
  .post-cover {
    height: 250px;
  }
  
  .post-content {
    padding: 1rem;
  }
  
  .post-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>