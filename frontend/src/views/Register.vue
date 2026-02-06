<template>
  <div class="max-w-md mx-auto py-8">
    <div class="bg-white p-8 rounded-lg shadow-sm">
      <h1 class="text-center mb-8 text-gray-800 text-2xl font-light">Register</h1>
      <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="email" class="font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            class="p-3 border border-gray-300 rounded-sm text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-10"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="password" class="font-medium text-gray-700">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            minlength="6"
            class="p-3 border border-gray-300 rounded-sm text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-10"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="confirmPassword" class="font-medium text-gray-700">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Confirm your password"
            minlength="6"
            class="p-3 border border-gray-300 rounded-sm text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-10"
          />
        </div>
        <button type="submit" :disabled="loading" class="py-3 px-6 rounded-sm font-medium cursor-pointer transition-all border-none bg-gray-800 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      <p class="text-center mt-4 text-gray-600">
        Already have an account? <router-link to="/login" class="text-indigo-500 no-underline hover:underline">Login here</router-link>
      </p>
      <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-sm mt-4 text-center">
        {{ error }}
      </div>
      <div v-if="success" class="bg-green-50 text-green-600 p-3 rounded-sm mt-4 text-center">
        {{ success }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/auth.js'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const loading = ref(false)
    const error = ref('')
    const success = ref('')

    const handleRegister = async () => {
      if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match'
        return
      }

      loading.value = true
      error.value = ''
      success.value = ''
      
      try {
        await authService.register(email.value, password.value)
        success.value = 'Registration successful! Redirecting...'
        setTimeout(() => {
          router.push('/posts')
        }, 2000)
      } catch (err) {
        error.value = err.response?.data?.error || 'Registration failed'
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      confirmPassword,
      loading,
      error,
      success,
      handleRegister
    }
  }
}
</script>

<style scoped>
</style>