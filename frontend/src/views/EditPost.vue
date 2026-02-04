<template>
  <div class="edit-post">
    <h1>Edit Post</h1>
    
    <div v-if="loading" class="loading">
      Loading post...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <form v-else @submit.prevent="handleSubmit" class="post-form">
      <div class="form-group">
        <label for="title">Title *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          placeholder="Enter a catchy title for your post"
        />
      </div>

      <div class="form-group">
        <label for="slug">URL Slug</label>
        <input
          id="slug"
          v-model="form.slug"
          type="text"
          placeholder="my-awesome-post"
        />
        <small>Only letters, numbers, and hyphens allowed.</small>
      </div>

      <div class="form-group">
        <label for="tag">Category/Tag</label>
        <input
          id="tag"
          v-model="form.tag"
          type="text"
          placeholder="technology, tutorial, lifestyle..."
        />
        <small>Helps readers find your post</small>
      </div>

      <div class="form-group">
        <label for="cover">Cover Image URL</label>
        <input
          id="cover"
          v-model="form.cover"
          type="url"
          placeholder="https://example.com/image.jpg (optional)"
        />
        <small>Add a beautiful image to grab attention</small>
      </div>

      <div class="form-group">
        <label for="content">Content *</label>
        <RichEditor 
          v-model="form.content" 
          placeholder="Edit your amazing content here..."
        />
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="saving" class="btn btn-primary">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button type="button" @click="previewPost" class="btn btn-secondary">
          Preview
        </button>
        <router-link :to="`/posts/${post.slug || post.id}`" class="btn btn-outline">
          Cancel
        </router-link>
      </div>
    </form>

    <div v-if="saveError" class="error-message">
      {{ saveError }}
    </div>

    <div v-if="success" class="success-message">
      {{ success }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postService } from '../services/posts.js'
import RichEditor from '../components/RichEditor.vue'

export default {
  name: 'EditPost',
  components: {
    RichEditor
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const post = ref(null)
    const loading = ref(true)
    const error = ref('')
    const saving = ref(false)
    const saveError = ref('')
    const success = ref('')

    const form = reactive({
      title: '',
      slug: '',
      content: '',
      tag: '',
      cover: '',
      date: ''
    })

    const fetchPost = async () => {
      try {
        const postId = route.params.id
        post.value = await postService.getPost(postId)
        
        // Small delay to ensure reactive form is ready
        setTimeout(() => {
          // Populate form with post data
          form.title = post.value.title || ''
          form.slug = post.value.slug || ''
          form.content = post.value.content || ''
          form.tag = post.value.tag || ''
          form.cover = post.value.cover || ''
          form.date = post.value.date || ''
        }, 50)
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

    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    const handleSubmit = async () => {
      saving.value = true
      saveError.value = ''
      success.value = ''

      try {
        const postId = post.value.id
        const updateData = { ...form }
        
        // Remove empty fields from update
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === '') {
            updateData[key] = null
          }
        })

        await postService.updatePost(postId, updateData)
        success.value = 'Post updated successfully!'
        
        setTimeout(() => {
          router.push(`/posts/${form.slug || postId}`)
        }, 1500)
      } catch (err) {
        if (err.response?.status === 401) {
          saveError.value = 'Please login to edit posts. You need to be authenticated to save changes.'
        } else {
          saveError.value = err.response?.data?.error || 'Failed to update post'
        }
      } finally {
        saving.value = false
      }
    }

    const previewPost = () => {
      // Create a temporary post object for preview
      const previewData = {
        ...post.value,
        ...form
      }
      
      // Store preview data and open in new tab
      localStorage.setItem('postPreview', JSON.stringify(previewData))
      window.open('/preview', '_blank')
    }

    onMounted(fetchPost)

    return {
      form,
      post,
      loading,
      error,
      saving,
      saveError,
      success,
      handleSubmit,
      previewPost
    }
  }
}
</script>

<style scoped>
.edit-post {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #dc2626;
}

.post-form {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
  border-left: 4px solid #dc2626;
}

.success-message {
  background: #f0fdf4;
  color: #16a34a;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
  border-left: 4px solid #16a34a;
}

@media (max-width: 768px) {
  .edit-post {
    padding: 0 1rem;
  }
  
  .post-form {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    text-align: center;
  }
}
</style>