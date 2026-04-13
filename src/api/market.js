import client from './client'

export const marketApi = {
  getQuote: (symbol) =>
    client.get(`/tickers/${symbol}/quote/`).then((r) => r.data),

  getPrices: (symbol) =>
    client.get(`/tickers/${symbol}/prices/`).then((r) => r.data),

  getIndicators: (symbol) =>
    client.get(`/tickers/${symbol}/indicators/`).then((r) => r.data),
}
