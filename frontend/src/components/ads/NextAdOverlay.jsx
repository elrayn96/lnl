import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function NextAdOverlay({ onComplete }) {
  const [count, setCount] = useState(3)
  useEffect(() => {
    const timer = setInterval(() => setCount((value) => {
      if (value <= 1) { clearInterval(timer); onComplete(); return 0 }
      return value - 1
    }), 1000)
    return () => clearInterval(timer)
  }, [onComplete])
  return <div className="ad-overlay" role="dialog" aria-modal="true" aria-label="Publicidade entre conversas">
    <div className="ad-overlay__card glass-card">
      <span className="sponsored">Patrocinado</span>
      <div className="fallback-promo"><Sparkles /><h2>Uma pausa rápida</h2><p>A próxima ligação começa em instantes.</p></div>
      <div className="countdown"><strong>{count}</strong><span>A procurar a seguir…</span></div>
    </div>
  </div>
}
