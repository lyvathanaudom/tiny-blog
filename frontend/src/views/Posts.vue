<template>
  <div class="posts">
    <div class="posts-header">
      <h1>Blog Posts</h1>
      <div class="posts-actions">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search posts..."
            @input="handleSearch"
          />
        </div>
        <router-link v-if="isAuthenticated" to="/create" class="btn btn-primary">
          Create Post
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="loading">
      Loading posts...
    </div>

    <div v-else-if="posts.length === 0" class="empty-state">
      <p>No posts found.</p>
      <router-link v-if="isAuthenticated" to="/create" class="btn btn-primary">
        Create the first post
      </router-link>
    </div>

    <div v-else class="posts-grid">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-cover" v-if="post.cover">
          <img :src="post.cover" :alt="post.title" />
        </div>
        <div class="post-content">
          <h2 class="post-title">
            <router-link :to="`/posts/${post.slug || post.id}`">
              {{ post.title }}
            </router-link>
          </h2>
          <p class="post-excerpt">{{ getExcerpt(post.content) }}</p>
          <div class="post-meta">
            <span class="post-date">{{ formatDate(post.created_at) }}</span>
            <span v-if="post.tag" class="post-tag">{{ post.tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button
        :disabled="currentPage === 1"
        @click="previousPage"
        class="btn btn-secondary"
      >
        Previous
      </button>
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        :disabled="currentPage === totalPages"
        @click="nextPage"
        class="btn btn-secondary"
      >
        Next
      </button>
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
  max-width: 1200px;
  margin: 0 auto;
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.posts-header h1 {
  color: #1f2937;
  margin: 0;
}

.posts-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box input {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  width: 250px;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.post-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-cover {
  height: 200px;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  padding: 1.5rem;
}

.post-title {
  margin-bottom: 0.5rem;
}

.post-title a {
  color: #1f2937;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: 600;
}

.post-title a:hover {
  color: #3b82f6;
}

.post-excerpt {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #9ca3af;
}

.post-tag {
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-info {
  color: #6b7280;
}

@media (max-width: 768px) {
  .posts-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .posts-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>