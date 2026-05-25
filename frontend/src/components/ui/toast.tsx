import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

type ToastItem = {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}

type ConfirmState = {
  message: string
  resolve: (value: boolean) => void
} | null

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void
  confirm: (message: string) => Promise<boolean>
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-emerald-500/45 bg-emerald-950/95 text-emerald-50',
  error: 'border-red-500/45 bg-red-950/95 text-red-50',
  warning: 'border-amber-500/45 bg-amber-950/95 text-amber-50',
  info: 'border-neon-cyan/45 bg-cyber-900/95 text-slate-100',
}

const VARIANT_ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const DEFAULT_DURATION = 4500

let externalToast: ToastContextValue['toast'] = () => {}
let externalConfirm: ToastContextValue['confirm'] = async () => false

/** Imperative toast API — use from anywhere after ToastProvider is mounted. */
export const toast = {
  success: (message: string, duration?: number) => externalToast(message, 'success', duration),
  error: (message: string, duration?: number) => externalToast(message, 'error', duration),
  warning: (message: string, duration?: number) => externalToast(message, 'warning', duration),
  info: (message: string, duration?: number) => externalToast(message, 'info', duration),
  confirm: (message: string) => externalConfirm(message),
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ConfirmDialog({
  message,
  onCancel,
  onConfirm,
}: {
  message: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/75"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="toast-confirm-title"
        className="w-full max-w-md rounded-xl border border-cyber-600 bg-cyber-950 p-5 shadow-2xl pointer-events-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-5">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <p id="toast-confirm-title" className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="cursor-pointer" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" className="cursor-pointer" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [confirm, setConfirm] = useState<ConfirmState>(null)

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((message: string, variant: ToastVariant = 'info', duration = DEFAULT_DURATION) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, variant, duration }])
    window.setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const askConfirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirm({ message, resolve })
    })
  }, [])

  useEffect(() => {
    externalToast = push
    externalConfirm = askConfirm
    return () => {
      externalToast = () => {}
      externalConfirm = async () => false
    }
  }, [push, askConfirm])

  const resolveConfirm = useCallback(
    (value: boolean) => {
      setConfirm((current) => {
        current?.resolve(value)
        return null
      })
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toast: push, confirm: askConfirm }}>
      {children}

      <div
        aria-live="polite"
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-[200] flex flex-col gap-2 w-[min(100vw-1.5rem,22rem)] pointer-events-none"
      >
        {toasts.map(({ id, message, variant }) => {
          const Icon = VARIANT_ICONS[variant]
          return (
            <div
              key={id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-2.5 rounded-lg border px-3.5 py-3 shadow-xl shadow-black/40 text-sm leading-snug',
                VARIANT_STYLES[variant]
              )}
            >
              <Icon className="h-4 w-4 shrink-0 mt-0.5 opacity-90" aria-hidden />
              <p className="flex-1 min-w-0">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      {confirm &&
        createPortal(
          <ConfirmDialog
            message={confirm.message}
            onCancel={() => resolveConfirm(false)}
            onConfirm={() => resolveConfirm(true)}
          />,
          document.body
        )}
    </ToastContext.Provider>
  )
}
