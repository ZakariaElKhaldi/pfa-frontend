import client from './client'

export const adminApi = {
  getUsers: (params) =>
    client.get('/admin/users/', { params }).then((r) => r.data),

  updateUser: (id, payload) =>
    client.patch(`/admin/users/${id}/`, payload).then((r) => r.data),

  deleteUser: (id) =>
    client.delete(`/admin/users/${id}/`).then((r) => r.data),

  getSystemStats: () =>
    client.get('/admin/stats/').then((r) => r.data),
}

export const exportApi = {
  exportSignals: (params) =>
    client.get('/export/signals/', { params, responseType: 'blob' }).then((r) => r.data),

  exportPortfolio: (params) =>
    client.get('/export/portfolio/', { params, responseType: 'blob' }).then((r) => r.data),
}
