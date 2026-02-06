<template>
  <div class="min-h-screen">
    <nav class="flex justify-between items-center md:px-8 md:py-8 px-4 py-4 border-b border-gray-100">
      <div class="nav-brand">
        <router-link to="/" class="text-lg font-light no-underline text-gray-900">Tiny Blog</router-link>
      </div>
      <div class="flex items-center gap-4 md:gap-8">
        <router-link to="/" exact-active-class="text-gray-900" class="text-xs no-underline text-gray-500 uppercase tracking-wide transition-colors hover:text-gray-900">Home</router-link>
        <router-link to="/posts" exact-active-class="text-gray-900" class="text-xs no-underline text-gray-500 uppercase tracking-wide transition-colors hover:text-gray-900">Posts</router-link>
        <template v-if="user">
          <router-link to="/create" exact-active-class="text-gray-900" class="text-xs no-underline text-gray-500 uppercase tracking-wide transition-colors hover:text-gray-900">Create</router-link>
          <button @click="logout" class="bg-none border-none text-gray-500 text-xs uppercase tracking-wide cursor-pointer p-0 transition-colors hover:text-gray-900">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login" exact-active-class="text-gray-900" class="text-xs no-underline text-gray-500 uppercase tracking-wide transition-colors hover:text-gray-900">Login</router-link>
          <router-link to="/register" exact-active-class="text-gray-900" class="text-xs no-underline text-gray-500 uppercase tracking-wide transition-colors hover:text-gray-900">Register</router-link>
        </template>
      </div>
    </nav>
    <main class="max-w-2xl mx-auto md:px-8 md:py-16 px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    
    const user = computed(() => {
      const token = localStorage.getItem('token')
      return token ? { token } : null
    })

    const logout = () => {
      localStorage.removeItem('token')
      router.push('/login')
    }

    onMounted(() => {
      // Check if user is logged in on app load
      const token = localStorage.getItem('token')
      if (token) {
        // You could validate token here if needed
      }
    })

    return {
      user,
      logout
    }
  }
}
</script>

<style scoped>
.router-link-active {
  @apply text-gray-900;
}

@media (max-width: 768px) {
  nav {
    @apply px-4 py-4;
  }
  
  .nav-links {
    @apply gap-4;
  }
  
  main {
    @apply px-4 py-8;
  }
}
</style>