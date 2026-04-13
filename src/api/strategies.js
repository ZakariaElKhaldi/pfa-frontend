import client from './client'

export const strategiesApi = {
  list: () =>
    client.get('/strategies/').then((r) => r.data),

  create: (payload) =>
    client.post('/strategies/', payload).then((r) => r.data),

  update: (id, payload) =>
    client.patch(`/strategies/${id}/`, payload).then((r) => r.data),

  delete: (id) =>
    client.delete(`/strategies/${id}/`).then((r) => r.data),

  toggle: (id) =>
    client.post(`/strategies/${id}/toggle/`).then((r) => r.data),

  getExecutions: (id) =>
    client.get(`/strategies/${id}/executions/`).then((r) => r.data),
}
