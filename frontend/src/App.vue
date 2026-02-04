<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/">Tiny Blog</router-link>
      </div>
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/posts">Posts</router-link>
        <template v-if="user">
          <router-link to="/create">Create</router-link>
          <button @click="logout">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Register</router-link>
        </template>
      </div>
    </nav>
    <main>
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
#app {
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.nav-brand a {
  text-decoration: none;
  color: #333;
  font-size: 1.125rem;
  font-weight: 300;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #333;
}

.nav-links button {
  background: none;
  border: none;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  padding: 0;
}

.nav-links button:hover {
  color: #333;
}

main {
  max-width: 680px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  main {
    padding: 2rem 1rem;
  }
}
</style>