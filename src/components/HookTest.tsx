import { useOHLCData } from '@/hooks/useOHLCData'
import { useEffect } from 'react'

export function HookTest() {
  const { bars, status, loading, error } = useOHLCData('AAPL')

  useEffect(() => {
    if (bars.length > 0) {
      console.log('HookTest Bars:', bars.slice(-2))
    }
    console.log('HookTest Status:', status)
  }, [bars, status])

  if (loading) return <div>Loading hook test...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div style={{ padding: 10, background: 'rgba(0,0,0,0.05)', borderRadius: 8, fontSize: 12 }}>
      <strong>Hook Test (AAPL)</strong>
      <div>Status: {status}</div>
      <div>Bars: {bars.length}</div>
      <div>Latest: {bars[bars.length - 1]?.close}</div>
    </div>
  )
}
