import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const user = localStorage.getItem('larkspur_user')
  if (user) {
    config.headers['x-user'] = user
  }
  return config
})

export default api
