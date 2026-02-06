<template>
  <div class="max-w-4xl mx-auto p-8">
    <div class="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 flex-wrap gap-4">
      <h1 class="text-3xl font-light text-gray-900 m-0">Post Preview</h1>
      <div class="flex gap-2">
        <button @click="closePreview" class="px-4 py-2 bg-gray-500 text-white rounded-sm font-medium hover:bg-gray-600 transition-colors border-none cursor-pointer">Close Preview</button>
        <button @click="editPost" class="px-4 py-2 bg-gray-800 text-white rounded-sm font-medium hover:bg-gray-600 transition-colors border-none cursor-pointer">Edit Post</button>
      </div>
    </div>

    <article v-if="previewData" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <header class="p-8 pb-4 border-b border-gray-100">
        <h1 class="text-4xl font-bold text-gray-900 mb-4 leading-tight">{{ previewData.title }}</h1>
        <div class="flex items-center gap-4 text-gray-500 text-sm">
          <time :datetime="previewData.date || previewData.created_at">
            {{ formatDate(previewData.date || previewData.created_at) }}
          </time>
          <span v-if="previewData.tag" class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{{ previewData.tag }}</span>
        </div>
      </header>

      <div v-if="previewData.cover" class="w-full h-96 overflow-hidden">
        <img :src="previewData.cover" :alt="previewData.title" class="w-full h-full object-cover" />
      </div>

      <div class="p-8 leading-relaxed text-gray-700 prose prose-lg max-w-none" v-html="previewData.content"></div>

      <footer class="px-8 py-4 border-t border-gray-100">
        <p class="text-gray-500 italic text-center m-0">
          This is a preview. The post has not been published yet.
        </p>
      </footer>
    </article>

    <div v-else class="text-center py-12 text-gray-500">
      <h2 class="text-2xl font-light mb-4">No Preview Data</h2>
      <p class="mb-6">Please go back and edit a post to see the preview.</p>
      <button @click="closePreview" class="px-4 py-2 bg-gray-800 text-white rounded-sm font-medium hover:bg-gray-600 transition-colors border-none cursor-pointer">Back to Editor</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'PreviewPost',
  setup() {
    const router = useRouter()
    const previewData = ref(null)

    const loadPreviewData = () => {
      const data = localStorage.getItem('postPreview')
      if (data) {
        previewData.value = JSON.parse(data)
      }
    }

    const closePreview = () => {
      window.close()
      // If window.close() doesn't work (due to browser restrictions), navigate back
      if (!window.closed) {
        router.back()
      }
    }

    const editPost = () => {
      // Get the post ID from preview data if available
      if (previewData.value?.id) {
        router.push(`/edit/${previewData.value.id}`)
      } else {
        router.push('/create')
      }
      closePreview()
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(loadPreviewData)

    return {
      previewData,
      closePreview,
      editPost,
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