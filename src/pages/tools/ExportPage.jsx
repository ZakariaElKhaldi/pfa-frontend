import { useState } from 'react'
import { exportApi } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Download, FileText } from 'lucide-react'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href    = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportPage() {
  const [loading, setLoading] = useState({})
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')
  const [format, setFormat]   = useState('csv')

  const handleExport = async (key, apiFn, baseFilename) => {
    setLoading((l) => ({ ...l, [key]: true }))
    const params = { format }
    if (from) params.from = from
    if (to)   params.to   = to
    try {
      const blob = await apiFn(params)
      downloadBlob(blob, `${baseFilename}.${format}`)
    } catch (err) {
      console.error('Export failed', err)
    } finally {
      setLoading((l) => ({ ...l, [key]: false }))
    }
  }

  const exports = [
    {
      key:   'signals',
      label: 'Signal History',
      desc:  'All signals with direction, confidence, and outcome',
      base:  'crowdsignal-signals',
      fn:    exportApi.exportSignals,
    },
    {
      key:   'portfolio',
      label: 'Portfolio / Trades',
      desc:  'Trade history CSV',
      base:  'crowdsignal-portfolio',
      fn:    exportApi.exportPortfolio,
    },
  ]

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <h2 className="text-sm font-semibold text-primary-text">Export Data</h2>

      <Card className="bg-container border-0 p-4">
        <p className="text-[10px] text-muted uppercase tracking-wider mb-3">Options</p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-subtle">From</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-8 text-xs bg-surface border-container w-36"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-subtle">To</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-8 text-xs bg-surface border-container w-36"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-subtle">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="h-8 w-24 text-xs bg-surface border-container">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-container border-container">
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {exports.map((e) => (
        <Card key={e.key} className="bg-container border-0 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-action-container flex items-center justify-center shrink-0">
            <FileText size={18} className="text-action" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary-text">{e.label}</p>
            <p className="text-xs text-subtle mt-0.5">{e.desc}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={loading[e.key]}
            onClick={() => handleExport(e.key, e.fn, e.base)}
            className="shrink-0 h-8 gap-1.5 border-container text-secondary text-xs"
          >
            <Download size={13} />
            {loading[e.key] ? 'Exporting…' : format.toUpperCase()}
          </Button>
        </Card>
      ))}
    </div>
  )
}
