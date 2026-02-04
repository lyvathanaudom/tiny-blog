<template>
  <div class="rich-editor">
    <div class="editor-toolbar">
      <button type="button" @click="formatText('bold')" class="toolbar-btn" title="Bold">
        <strong>B</strong>
      </button>
      <button type="button" @click="formatText('italic')" class="toolbar-btn" title="Italic">
        <em>I</em>
      </button>
      <button type="button" @click="formatText('underline')" class="toolbar-btn" title="Underline">
        <u>U</u>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button type="button" @click="formatText('formatBlock', 'h2')" class="toolbar-btn" title="Heading">
        H
      </button>
      <button type="button" @click="formatText('formatBlock', 'p')" class="toolbar-btn" title="Paragraph">
        P
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button type="button" @click="formatText('insertUnorderedList')" class="toolbar-btn" title="Bullet List">
        • List
      </button>
      <button type="button" @click="formatText('insertOrderedList')" class="toolbar-btn" title="Numbered List">
        1. List
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button type="button" @click="insertLink" class="toolbar-btn" title="Insert Link">
        🔗
      </button>
      <button type="button" @click="formatText('insertHorizontalRule')" class="toolbar-btn" title="Horizontal Line">
        —
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button type="button" @click="formatText('removeFormat')" class="toolbar-btn" title="Clear Formatting">
        Clear
      </button>
    </div>
    
    <div
      ref="editor"
      class="editor-content"
      contenteditable="true"
      @input="updateContent"
      @keydown="handleKeydown"
      placeholder="Start writing your post..."
    ></div>
    
    <div class="editor-preview" v-if="showPreview">
      <h4>Preview:</h4>
      <div class="preview-content" v-html="content"></div>
    </div>
    
    <div class="editor-help">
      <h4>Quick Tips:</h4>
      <ul>
        <li><kbd>Ctrl+B</kbd> for bold</li>
        <li><kbd>Ctrl+I</kbd> for italic</li>
        <li><kbd>Ctrl+U</kbd> for underline</li>
        <li><kbd>Ctrl+K</kbd> to insert link</li>
        <li>Use <kbd>Tab</kbd> to indent lists</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

export default {
  name: 'RichEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const editor = ref(null)
    const content = ref(props.modelValue || '')
    const showPreview = ref(false)

    const updateContent = () => {
      content.value = editor.value.innerHTML
      emit('update:modelValue', content.value)
    }

    const formatText = (command, value = null) => {
      document.execCommand(command, false, value)
      editor.value.focus()
      updateContent()
    }

    const insertLink = () => {
      const url = prompt('Enter URL:')
      if (url) {
        formatText('createLink', url)
      }
    }

    const handleKeydown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b':
            event.preventDefault()
            formatText('bold')
            break
          case 'i':
            event.preventDefault()
            formatText('italic')
            break
          case 'u':
            event.preventDefault()
            formatText('underline')
            break
          case 'k':
            event.preventDefault()
            insertLink()
            break
        }
      }
    }

    const setContent = (newContent) => {
      if (editor.value && newContent !== content.value) {
        editor.value.innerHTML = newContent
        content.value = newContent
      }
    }

    watch(() => props.modelValue, (newValue, oldValue) => {
      // Only update if the value actually changed and came from parent
      if (editor.value && newValue !== oldValue && newValue !== content.value) {
        setContent(newValue || '')
      }
    }, { immediate: true })

    onMounted(() => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (props.modelValue) {
          setContent(props.modelValue)
        }
        editor.value.focus()
      }, 100)
    })

    return {
      editor,
      content,
      showPreview,
      updateContent,
      formatText,
      insertLink,
      handleKeydown
    }
  }
}
</script>

<style scoped>
.rich-editor {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.toolbar-btn {
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  min-width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.toolbar-btn:active {
  background: #e5e7eb;
}

.toolbar-divider {
  width: 1px;
  height: 1.5rem;
  background: #e5e7eb;
  margin: 0 0.25rem;
}

.editor-content {
  min-height: 300px;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.6;
  color: #374151;
  overflow-y: auto;
}

.editor-content:focus {
  outline: none;
  background: #fafafa;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: #9ca3af;
  pointer-events: none;
}

.editor-preview {
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
}

.editor-preview h4 {
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
}

.preview-content {
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  padding: 1rem;
  min-height: 100px;
  background: #f9fafb;
}

.editor-help {
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  background: #f9fafb;
}

.editor-help h4 {
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
}

.editor-help ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.editor-help li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

kbd {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-family: monospace;
  color: #374151;
}

/* Editor content styling */
.editor-content h1,
.editor-content h2,
.editor-content h3,
.editor-content h4,
.editor-content h5,
.editor-content h6 {
  margin: 1rem 0 0.5rem;
  color: #1f2937;
  font-weight: 600;
}

.editor-content h1 { font-size: 1.875rem; }
.editor-content h2 { font-size: 1.5rem; }
.editor-content h3 { font-size: 1.25rem; }

.editor-content p {
  margin-bottom: 1rem;
}

.editor-content ul,
.editor-content ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.editor-content li {
  margin-bottom: 0.25rem;
}

.editor-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.editor-content hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1rem 0;
}
</style>