import client from './client'

export const tickersApi = {
  search: (q) =>
    client.get('/tickers/', { params: { search: q } }).then((r) => r.data),

  getWatchlist: () =>
    client.get('/watchlist/').then((r) => r.data),

  addToWatchlist: (symbol) =>
    client.post('/watchlist/', { symbol }).then((r) => r.data),

  removeFromWatchlist: (symbol) =>
    client.delete(`/watchlist/${symbol}/`).then((r) => r.data),
}
