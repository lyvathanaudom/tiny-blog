<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-light text-gray-900 mb-8 text-center">Create New Post</h1>
    
    <form @submit.prevent="handleSubmit" class="bg-white p-8 rounded-lg shadow-sm">
      <div class="mb-6">
        <label for="title" class="block font-semibold text-gray-700 mb-2">Title *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          placeholder="Enter a catchy title for your post"
          class="w-full p-3 border border-gray-300 rounded-sm text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-10"
        />
      </div>

      <div class="mb-6">
        <label for="slug" class="block font-semibold text-gray-700 mb-2">URL Slug</label>
        <input
          id="slug"
          v-model="form.slug"
          type="text"
          placeholder="my-awesome-post (optional, will be generated from title)"
          class="w-full p-3 border border-gray-300 rounded-sm text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-10"
        />
        <small class="block mt-1 text-gray-500 text-sm">Leave empty to auto-generate from title. Only letters, numbers, and hyphens allowed.</small>
      </div>

      <div class="mb-6">
        <label for="tag" class="block font-semibold text-gray-700 mb-2">Category/Tag</label>
        <input
          id="tag"
          v-model="form.tag"
          type="text"
          placeholder="technology, tutorial, lifestyle..."
          class="w-full p-3 border border-gray-300 rounded-sm text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-10"
        />
        <small class="block mt-1 text-gray-500 text-sm">Helps readers find your post</small>
      </div>

      <div class="mb-6">
        <label for="cover" class="block font-semibold text-gray-700 mb-2">Cover Image URL</label>
        <input
          id="cover"
          v-model="form.cover"
          type="url"
          placeholder="https://example.com/image.jpg (optional)"
          class="w-full p-3 border border-gray-300 rounded-sm text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-10"
        />
        <small class="block mt-1 text-gray-500 text-sm">Add a beautiful image to grab attention</small>
      </div>

      <div class="mb-6">
        <label for="content" class="block font-semibold text-gray-700 mb-2">Content *</label>
        <RichEditor 
          v-model="form.content" 
          placeholder="Write your amazing content here..."
        />
      </div>

      <div class="flex gap-4 items-center mt-8 flex-wrap">
        <button type="submit" :disabled="loading" class="px-6 py-3 rounded-sm font-medium cursor-pointer transition-all border-none bg-gray-800 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Publishing...' : 'Publish Post' }}
        </button>
        <button type="button" @click="saveDraft" :disabled="loading" class="px-6 py-3 rounded-sm font-medium cursor-pointer transition-all border-none bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
          Save as Draft
        </button>
        <router-link to="/posts" class="px-6 py-3 rounded-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors no-underline">
          Cancel
        </router-link>
      </div>
    </form>

    <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-sm mt-4 border-l-4 border-red-600">
      {{ error }}
    </div>

    <div v-if="success" class="bg-green-50 text-green-600 p-4 rounded-sm mt-4 border-l-4 border-green-600">
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
/* Using Tailwind classes in template, no custom CSS needed */
</style>