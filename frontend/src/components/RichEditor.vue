<template>
  <div class="border border-gray-300 rounded-lg bg-white">
    <div class="flex items-center p-2 border-b border-gray-200 flex-wrap gap-1">
      <button type="button" @click="formatText('bold')" class="p-2 border border-transparent rounded bg-transparent cursor-pointer text-sm min-w-8 h-8 flex items-center justify-center transition-all hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200" title="Bold">
        <strong>B</strong>
      </button>
      <button type="button" @click="formatText('italic')" class="p-2 border border-transparent rounded bg-transparent cursor-pointer text-sm min-w-8 h-8 flex items-center justify-center transition-all hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200" title="Italic">
        <em>I</em>
      </button>
      <button type="button" @click="formatText('underline')" class="p-2 border border-transparent rounded bg-transparent cursor-pointer text-sm min-w-8 h-8 flex items-center justify-center transition-all hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200" title="Underline">
        <u>U</u>
      </button>
      
      <div class="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button type="button" @click="formatText('formatBlock', 'h2')" class="p-2 border border-transparent rounded bg-transparent cursor-pointer text-sm min-w-8 h-8 flex items-center justify-center transition-all hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200" title="Heading">
        H
      </button>
      <button type="button" @click="formatText('formatBlock', 'p')" class="p-2 border border-transparent rounded bg-transparent cursor-pointer text-sm min-w-8 h-8 flex items-center justify-center transition-all hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200" title="Paragraph">
        P
      </button>
      
      <div class="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button type="button" @click="formatText('insertUnorderedList')" class="p-2 border border-transparent rounded bg-transparent cursor-pointer text-sm min-w-8 h-8 flex items-center justify-center transition-all hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200" title="Bullet List">
        • List
      </button>
      <button type="button" @click="formatText('insertOrderedList')" class="p-2 border border-transparent rounded bg-transparent cursor-pointer text-sm min-w-8 h-8 flex items-center justify-center transition-all hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200" title="Numbered List">
        1. List
      </button>
      
      <div class="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button type="button" @click="insertLink" class="p-2 border border-transparent rounded bg-transparent cursor-pointer text-sm min-w-8 h-8 flex items-center justify-center transition-all hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200" title="Insert Link">
        🔗
      </button>
      <button type="button" @click="formatText('insertHorizontalRule')" class="p-2 border border-transparent rounded bg-transparent cursor-pointer text-sm min-w-8 h-8 flex items-center justify-center transition-all hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200" title="Horizontal Line">
        —
      </button>
      
      <div class="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button type="button" @click="formatText('removeFormat')" class="p-2 border border-transparent rounded bg-transparent cursor-pointer text-sm min-w-8 h-8 flex items-center justify-center transition-all hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200" title="Clear Formatting">
        Clear
      </button>
    </div>
    
    <div
      ref="editor"
      class="min-h-80 p-4 text-base leading-relaxed text-gray-700 overflow-y-auto focus:outline-none focus:bg-gray-50"
      contenteditable="true"
      @input="updateContent"
      @keydown="handleKeydown"
      placeholder="Start writing your post..."
    ></div>
    
    <div class="border-t border-gray-200 p-4" v-if="showPreview">
      <h4 class="mb-2 text-gray-700 text-sm font-semibold">Preview:</h4>
      <div class="border border-gray-200 rounded p-4 min-h-24 bg-gray-50" v-html="content"></div>
    </div>
    
    <div class="border-t border-gray-200 p-4 bg-gray-50">
      <h4 class="mb-2 text-gray-700 text-sm font-semibold">Quick Tips:</h4>
      <ul class="list-none p-0 m-0">
        <li class="flex items-center gap-2 mb-1 text-sm text-gray-500">
          <kbd class="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-xs font-mono text-gray-700">Ctrl+B</kbd>
          for bold
        </li>
        <li class="flex items-center gap-2 mb-1 text-sm text-gray-500">
          <kbd class="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-xs font-mono text-gray-700">Ctrl+I</kbd>
          for italic
        </li>
        <li class="flex items-center gap-2 mb-1 text-sm text-gray-500">
          <kbd class="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-xs font-mono text-gray-700">Ctrl+U</kbd>
          for underline
        </li>
        <li class="flex items-center gap-2 mb-1 text-sm text-gray-500">
          <kbd class="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-xs font-mono text-gray-700">Ctrl+K</kbd>
          to insert link
        </li>
        <li class="flex items-center gap-2 mb-1 text-sm text-gray-500">
          Use <kbd class="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-xs font-mono text-gray-700">Tab</kbd>
          to indent lists
        </li>
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
/* Using Tailwind classes in template, minimal custom CSS needed */

/* Placeholder styling for contenteditable */
[contenteditable]:empty:before {
  content: attr(placeholder);
  color: #9ca3af;
  pointer-events: none;
}

/* Editor content styling */
:deep(h1),
:deep(h2),
:deep(h3),
:deep(h4),
:deep(h5),
:deep(h6) {
  margin: 1rem 0 0.5rem;
  color: #1f2937;
  font-weight: 600;
}

:deep(h1) { font-size: 1.875rem; }
:deep(h2) { font-size: 1.5rem; }
:deep(h3) { font-size: 1.25rem; }

:deep(p) {
  margin-bottom: 1rem;
}

:deep(ul),
:deep(ol) {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

:deep(li) {
  margin-bottom: 0.25rem;
}

:deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

:deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1rem 0;
}
</style>