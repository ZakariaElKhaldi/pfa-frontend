import client from './client'

export const alertsApi = {
  list: () =>
    client.get('/alerts/').then((r) => r.data),

  resolve: (pk) =>
    client.patch(`/alerts/${pk}/resolve/`).then((r) => r.data),
}
