<template>
  <div class="register">
    <div class="form-container">
      <h1>Register</h1>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            minlength="6"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Confirm your password"
            minlength="6"
          />
        </div>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      <p class="login-link">
        Already have an account? <router-link to="/login">Login here</router-link>
      </p>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="success" class="success-message">
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
.register {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 0;
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #1f2937;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #6b7280;
}

.login-link a {
  color: #3b82f6;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
  text-align: center;
}

.success-message {
  background: #f0fdf4;
  color: #16a34a;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
  text-align: center;
}
</style>