import api from './api.js'

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/signin', { email, password })
      if (response.data.session) {
        localStorage.setItem('token', response.data.session.access_token)
      }
      return response.data
    } catch (error) {
      if (error.response?.data?.error === 'Invalid login credentials') {
        throw new Error('Email or password is incorrect. Please check your credentials or create a new account.')
      }
      throw error
    }
  },

  async register(email, password) {
    try {
      const response = await api.post('/auth/signup', { email, password })
      if (response.data.session) {
        localStorage.setItem('token', response.data.session.access_token)
      }
      return response.data
    } catch (error) {
      if (error.response?.data?.error?.includes('email rate limit')) {
        throw new Error('Too many sign-up attempts. Please wait a few minutes or use a different email address.')
      }
      throw error
    }
  },

  logout() {
    localStorage.removeItem('token')
  },

  getToken() {
    return localStorage.getItem('token')
  },

  isAuthenticated() {
    return !!this.getToken()
  }
}