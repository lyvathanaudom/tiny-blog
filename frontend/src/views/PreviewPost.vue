<template>
  <div class="preview-post">
    <div class="preview-header">
      <h1>Post Preview</h1>
      <div class="preview-actions">
        <button @click="closePreview" class="btn btn-secondary">Close Preview</button>
        <button @click="editPost" class="btn btn-primary">Edit Post</button>
      </div>
    </div>

    <article v-if="previewData" class="post-article">
      <header class="post-header">
        <h1 class="post-title">{{ previewData.title }}</h1>
        <div class="post-meta">
          <time :datetime="previewData.date || previewData.created_at">
            {{ formatDate(previewData.date || previewData.created_at) }}
          </time>
          <span v-if="previewData.tag" class="post-tag">{{ previewData.tag }}</span>
        </div>
      </header>

      <div v-if="previewData.cover" class="post-cover">
        <img :src="previewData.cover" :alt="previewData.title" />
      </div>

      <div class="post-content" v-html="previewData.content"></div>

      <footer class="post-footer">
        <p class="preview-note">
          This is a preview. The post has not been published yet.
        </p>
      </footer>
    </article>

    <div v-else class="no-preview">
      <h2>No Preview Data</h2>
      <p>Please go back and edit a post to see the preview.</p>
      <button @click="closePreview" class="btn btn-primary">Back to Editor</button>
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
.preview-post {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 1rem;
}

.preview-header h1 {
  color: #1f2937;
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
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

.post-footer {
  padding: 1rem 2rem;
  border-top: 1px solid #e5e7eb;
}

.preview-note {
  color: #6b7280;
  font-style: italic;
  text-align: center;
  margin: 0;
}

.no-preview {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.no-preview h2 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
  border: none;
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

@media (max-width: 768px) {
  .preview-post {
    padding: 1rem;
  }
  
  .preview-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .preview-actions {
    justify-content: center;
  }
  
  .post-title {
    font-size: 2rem;
  }
  
  .post-cover {
    height: 250px;
  }
  
  .post-content {
    padding: 1rem;
  }
}
</style>