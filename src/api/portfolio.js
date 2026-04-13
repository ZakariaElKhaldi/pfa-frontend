import client from './client'

export const portfolioApi = {
  getSummary: () =>
    client.get('/portfolio/summary/').then((r) => r.data),

  getPortfolio: () =>
    client.get('/portfolio/').then((r) => r.data),

  buy: (payload) =>
    client.post('/portfolio/buy/', payload).then((r) => r.data),

  sell: (payload) =>
    client.post('/portfolio/sell/', payload).then((r) => r.data),

  getTrades: () =>
    client.get('/portfolio/trades/').then((r) => r.data),
}
