import client from './client'
import axios from 'axios'

export const authApi = {
  login: (credentials) =>
    axios.post('/api/auth/login/', credentials).then((r) => r.data),

  logout: () =>
    client.post('/auth/logout/').then((r) => r.data),

  me: () =>
    client.get('/auth/user/').then((r) => r.data),

  register: (payload) =>
    axios.post('/api/auth/registration/', payload).then((r) => r.data),

  changePassword: (payload) =>
    client.post('/auth/password/change/', payload).then((r) => r.data),
}
