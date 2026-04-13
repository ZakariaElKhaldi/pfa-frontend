import client from './client'

export const signalsApi = {
  getRecent: (limit = 20) =>
    client.get('/signals/recent/', { params: { limit } }).then((r) => r.data),

  getAccuracy: () =>
    client.get('/signals/accuracy/global/').then((r) => r.data),

  getBySymbol: (symbol) =>
    client.get(`/tickers/${symbol}/signal/history/`).then((r) => r.data),

  getSignal: (symbol) =>
    client.get(`/tickers/${symbol}/signal/`).then((r) => r.data),

  getExplain: (symbol) =>
    client.get(`/tickers/${symbol}/signal/explain/`).then((r) => r.data),
}
