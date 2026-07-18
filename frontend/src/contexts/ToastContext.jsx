import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'

const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const show = useCallback((message, tone = 'info') => {
    const id = crypto.randomUUID()
    setToasts((items) => [...items, { id, message, tone }])
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3800)
  }, [])
  const value = useMemo(() => ({ show }), [show])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div className={`toast toast--${toast.tone}`} key={toast.id}>
            {toast.tone === 'error' ? <CircleAlert /> : <CheckCircle2 />}
            <span>{toast.message}</span>
            <button aria-label="Fechar" onClick={() => setToasts((x) => x.filter((t) => t.id !== toast.id))}><X /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
