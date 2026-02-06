<template>
  <div class="text-center py-16">
    <div class="hero">
      <h1 class="text-5xl font-light mb-4 text-gray-900">Tiny Blog</h1>
      <p class="text-lg text-gray-500 mb-12 max-w-md mx-auto">A simple blog platform.</p>
      <div class="flex gap-8 justify-center">
        <router-link to="/posts" class="text-xs text-gray-500 uppercase tracking-wide border-b border-transparent transition-all hover:border-gray-400 hover:text-gray-900">Posts</router-link>
        <router-link v-if="!isAuthenticated" to="/register" class="text-xs text-gray-500 uppercase tracking-wide border-b border-transparent transition-all hover:border-gray-400 hover:text-gray-900">Get Started</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { authService } from '../services/auth.js'

export default {
  name: 'Home',
  setup() {
    const isAuthenticated = computed(() => authService.isAuthenticated())

    return {
      isAuthenticated
    }
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  .hero h1 {
    @apply text-4xl;
  }
  
  .hero p {
    @apply text-base;
  }
  
  .actions {
    @apply flex-col gap-4;
  }
}
</style>