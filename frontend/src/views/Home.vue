<template>
  <div class="home">
    <div class="hero">
      <h1>Welcome to Tiny Blog</h1>
      <p>A simple blog platform built with Vue.js and Supabase</p>
      <div class="hero-actions">
        <router-link to="/posts" class="btn btn-primary">View Posts</router-link>
        <router-link v-if="!isAuthenticated" to="/register" class="btn btn-secondary">Get Started</router-link>
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

.hero {
  max-width: 600px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 3rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
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
</style>