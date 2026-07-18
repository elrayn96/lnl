import { Clipboard, Link2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/common/GlassCard'
import { useToast } from '../contexts/ToastContext'

function extractUuid(input) {
  const match = input.trim().match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)
  return match?.[0]
}
export default function JoinRoomPage() {
  const [value, setValue] = useState('')
  const navigate = useNavigate()
  const toast = useToast()
  const submit = (e) => { e.preventDefault(); const uuid = extractUuid(value); uuid ? navigate(`/rooms/${uuid}`) : toast.show('Introduz um link ou código de sala válido.', 'error') }
  const paste = async () => { try { setValue(await navigator.clipboard.readText()) } catch { toast.show('Não foi possível aceder à área de transferência.', 'error') } }
  return <div className="page form-page"><GlassCard className="join-card"><span className="feature-icon feature-icon--purple"><Link2 /></span><span className="eyebrow">ENTRAR NUMA SALA</span><h1>Cola o teu convite.</h1><p>Usa o link recebido para entrar de forma anónima.</p><form className="modern-form" onSubmit={submit}><label>Link ou código da sala<div className="input-with-action"><input value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://…/rooms/…" autoFocus /><button type="button" onClick={paste} aria-label="Colar"><Clipboard /></button></div></label><button className="button button--primary button--wide">Entrar na sala</button></form></GlassCard></div>
}
