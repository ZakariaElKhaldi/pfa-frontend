import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface ConfirmDialogProps {
  open:        boolean
  title:       string
  description?: string
  confirmText?: string
  cancelText?:  string
  destructive?: boolean
  loading?:     boolean
  onConfirm: () => void
  onCancel:  () => void
}

export function ConfirmDialog({
  open, title, description,
  confirmText = 'Confirm',
  cancelText  = 'Cancel',
  destructive = false,
  loading     = false,
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>{cancelText}</Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Working…' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
