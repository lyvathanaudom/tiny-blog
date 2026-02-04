import api from './api.js'

export const postService = {
  async getPosts(params = {}) {
    const response = await api.get('/posts', { params })
    return response.data
  },

  async getPost(idOrSlug) {
    const response = await api.get(`/posts/${idOrSlug}`)
    return response.data
  },

  async createPost(postData) {
    const response = await api.post('/posts', postData)
    return response.data
  },

  async updatePost(id, postData) {
    const response = await api.put(`/posts/${id}`, postData)
    return response.data
  },

  async deletePost(id) {
    await api.delete(`/posts/${id}`)
  }
}