<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/" class="brand-link">Tiny Blog</router-link>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/posts" class="nav-link">Posts</router-link>
        <template v-if="user">
          <router-link to="/create" class="nav-link">Create</router-link>
          <button @click="logout" class="logout-btn">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/register" class="nav-link">Register</router-link>
        </template>
      </div>
    </nav>
    <main class="main-content">
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

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand .brand-link {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #1f2937;
  background: #f3f4f6;
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #dc2626;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}
</style>