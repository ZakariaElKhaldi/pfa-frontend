import client from './client'

export const socialApi = {
  getFeed: (params) =>
    client.get('/social/feed/', { params }).then((r) => r.data),

  getSentiment: (symbol) =>
    client.get(`/tickers/${symbol}/social/sentiment/`).then((r) => r.data),

  getTrending: () =>
    client.get('/social/trending/').then((r) => r.data),
}
