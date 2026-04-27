import { Icons } from '@/components/design-system'

interface TradeModalProps {
  open: boolean
  onClose: () => void
}

export function TradeModal({ open, onClose }: TradeModalProps) {
  if (!open) return null
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal animate-slide-up">
        <div className="modal-header">
          <div>
            <h2 id="modal-title" className="modal-title">Execute Trade</h2>
            <p className="card-subtitle">Paper portfolio · At market price</p>
          </div>
          <button
            className="btn btn-icon btn-secondary btn-sm"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icons.X size={14} />
          </button>
        </div>
        <div className="modal-body">
          <div className="input-wrapper">
            <label className="input-label" htmlFor="modal-symbol">Ticker Symbol</label>
            <input id="modal-symbol" className="input" defaultValue="AAPL" />
          </div>
          <div className="input-wrapper">
            <label className="input-label" htmlFor="modal-qty">Quantity (shares)</label>
            <input id="modal-qty" className="input" type="number" min="1" defaultValue="10" />
          </div>
          <div className="card card-recessed" style={{ padding: 'var(--space-4)' }}>
            <div className="cluster cluster-4" style={{ justifyContent: 'space-between' }}>
              <span className="text-label-md text-muted text-nav-label">Estimated Cost</span>
              <span className="text-mono-lg" style={{ fontWeight: 700 }}>$1,894.20</span>
            </div>
            <div className="cluster cluster-4" style={{ justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
              <span className="text-label-md text-muted text-nav-label">Current Price</span>
              <span className="text-mono-md">$189.42 / share</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-md" onClick={onClose} id="modal-cancel">Cancel</button>
          <button className="btn btn-primary btn-md" id="modal-buy-confirm">Confirm Buy</button>
        </div>
      </div>
    </div>
  )
}
