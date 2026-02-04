<template>
  <div class="create-post">
    <h1>Create New Post</h1>
    
    <form @submit.prevent="handleSubmit" class="post-form">
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
          placeholder="my-awesome-post (optional, will be generated from title)"
        />
        <small>Leave empty to auto-generate from title. Only letters, numbers, and hyphens allowed.</small>
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
          placeholder="Write your amazing content here..."
        />
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Publishing...' : 'Publish Post' }}
        </button>
        <button type="button" @click="saveDraft" :disabled="loading" class="btn btn-secondary">
          Save as Draft
        </button>
        <router-link to="/posts" class="btn btn-outline">
          Cancel
        </router-link>
      </div>
    </form>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="success" class="success-message">
      {{ success }}
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { postService } from '../services/posts.js'
import RichEditor from '../components/RichEditor.vue'

export default {
  name: 'CreatePost',
  components: {
    RichEditor
  },
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const error = ref('')
    const success = ref('')

    const form = reactive({
      title: '',
      slug: '',
      content: '',
      tag: '',
      cover: '',
      date: new Date().toISOString().split('T')[0]
    })

    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    // Auto-generate slug when title changes
    const updateTitle = (newTitle) => {
      form.title = newTitle
      if (!form.slug && newTitle) {
        form.slug = generateSlug(newTitle)
      }
    }

    const handleSubmit = async () => {
      loading.value = true
      error.value = ''
      success.value = ''

      try {
        const postData = { ...form }
        
        // Clean up empty fields
        Object.keys(postData).forEach(key => {
          if (postData[key] === '') {
            postData[key] = null
          }
        })

        await postService.createPost(postData)
        success.value = 'Post published successfully! Redirecting...'
        setTimeout(() => {
          router.push('/posts')
        }, 1500)
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to create post'
        console.error('Failed to create post:', err)
      } finally {
        loading.value = false
      }
    }

    const saveDraft = () => {
      // For now, just save to localStorage
      const draft = { ...form, savedAt: new Date().toISOString() }
      localStorage.setItem('postDraft', JSON.stringify(draft))
      success.value = 'Draft saved locally!'
      setTimeout(() => {
        success.value = ''
      }, 3000)
    }

    // Load draft if exists
    const loadDraft = () => {
      const draft = localStorage.getItem('postDraft')
      if (draft) {
        const draftData = JSON.parse(draft)
        Object.assign(form, draftData)
        success.value = 'Draft loaded from local storage'
        setTimeout(() => {
          success.value = ''
        }, 3000)
      }
    }

    return {
      form,
      loading,
      error,
      success,
      updateTitle,
      handleSubmit,
      saveDraft,
      loadDraft
    }
  }
}
</script>

<style scoped>
.create-post {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
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
  .create-post {
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