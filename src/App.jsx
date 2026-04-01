import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PortfolioPage from './pages/PortfolioPage'

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '8px 16px', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: 16 }}>Dashboard</Link>
        <Link to="/portfolio">Portfolio</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
      </Routes>
    </BrowserRouter>
  )
}
