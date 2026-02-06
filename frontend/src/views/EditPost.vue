<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-light text-gray-900 mb-8 text-center">Edit Post</h1>
    
    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading post...
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-600">
      {{ error }}
    </div>

    <form v-else @submit.prevent="handleSubmit" class="bg-white p-8 rounded-lg shadow-sm">
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
          placeholder="my-awesome-post"
          class="w-full p-3 border border-gray-300 rounded-sm text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-10"
        />
        <small class="block mt-1 text-gray-500 text-sm">Only letters, numbers, and hyphens allowed.</small>
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
          placeholder="Edit your amazing content here..."
        />
      </div>

      <div class="flex gap-4 items-center mt-8 flex-wrap">
        <button type="submit" :disabled="saving" class="px-6 py-3 rounded-sm font-medium cursor-pointer transition-all border-none bg-gray-800 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button type="button" @click="previewPost" class="px-6 py-3 rounded-sm font-medium cursor-pointer transition-all border-none bg-gray-800 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
          Preview
        </button>
        <router-link :to="`/posts/${post.slug || post.id}`" class="px-6 py-3 rounded-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors no-underline">
          Cancel
        </router-link>
      </div>
    </form>

    <div v-if="saveError" class="bg-red-50 text-red-600 p-4 rounded-sm mt-4 border-l-4 border-red-600">
      {{ saveError }}
    </div>

    <div v-if="success" class="bg-green-50 text-green-600 p-4 rounded-sm mt-4 border-l-4 border-green-600">
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
/* Using Tailwind classes in template, no custom CSS needed */
</style>