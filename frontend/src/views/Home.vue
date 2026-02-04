<template>
  <div class="home">
    <div class="hero">
      <h1>Tiny Blog</h1>
      <p>A simple blog platform.</p>
      <div class="actions">
        <router-link to="/posts">Posts</router-link>
        <router-link v-if="!isAuthenticated" to="/register">Get Started</router-link>
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
.home {
  text-align: center;
  padding: 4rem 0;
}

.hero h1 {
  font-size: 3rem;
  font-weight: 300;
  margin-bottom: 1rem;
  color: #333;
}

.hero p {
  font-size: 1.125rem;
  color: #666;
  margin-bottom: 3rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.actions {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.actions a {
  text-decoration: none;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;
}

.actions a:hover {
  border-bottom-color: #999;
  color: #333;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }
  
  .hero p {
    font-size: 1rem;
  }
  
  .actions {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>