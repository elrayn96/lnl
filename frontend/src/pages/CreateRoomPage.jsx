import { Check, Clock3, Copy, Link2, MessageCircle, Share2, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useNavigate } from 'react-router-dom'
import { roomApi } from '../api/roomApi'
import GlassCard from '../components/common/GlassCard'
import { useToast } from '../contexts/ToastContext'

export default function CreateRoomPage() {
  const [form, setForm] = useState({ title: '', description: '', duration: '15min', mode: 'text', isPublic: true })
  const [created, setCreated] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const set = (key, value) => setForm((x) => ({ ...x, [key]: value }))
  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setBusy(true)
    try { setCreated(await roomApi.create(form)) } catch (error) { toast.show(error.message, 'error') } finally { setBusy(false) }
  }
  const share = async () => {
    if (navigator.share) await navigator.share({ title: created.title, url: created.shareUrl })
    else { await navigator.clipboard.writeText(created.shareUrl); toast.show('Link copiado.') }
  }
  if (created) return <div className="page form-page"><GlassCard className="success-card"><span className="success-icon"><Check /></span><span className="eyebrow">SALA CRIADA</span><h1>Já podes receber perguntas.</h1><p>Partilha este link com quem quiseres convidar.</p><QRCodeSVG value={created.shareUrl} size={150} bgColor="transparent" fgColor="#f7f7ff" /><div className="copy-field"><span>{created.shareUrl}</span><button onClick={() => navigator.clipboard.writeText(created.shareUrl)} aria-label="Copiar link"><Copy /></button></div><div className="button-row"><button className="button button--primary" onClick={share}><Share2 /> Partilhar</button><button className="button button--soft" onClick={() => navigate(`/rooms/${created.uuid}`)}>Entrar na sala</button></div></GlassCard></div>
  return <div className="page form-page"><div className="page-heading"><span className="eyebrow">NOVA SALA</span><h1>Cria um espaço para perguntas honestas.</h1></div>
    <GlassCard><form className="modern-form" onSubmit={submit}>
      <label>Título da sala<input maxLength="80" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex: Pergunta-me qualquer coisa…" required /><small>{form.title.length}/80</small></label>
      <label>Descrição <span>(opcional)</span><textarea maxLength="240" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Dá algum contexto aos participantes" /></label>
      <fieldset><legend><Clock3 /> Duração</legend><div className="segmented">{[['15min','15 min'],['1h','1 hora'],['24h','24 horas']].map(([v,l]) => <button type="button" className={form.duration === v ? 'active' : ''} onClick={() => set('duration', v)} key={v}>{l}</button>)}</div></fieldset>
      <fieldset><legend>Modo</legend><div className="option-grid"><button type="button" className={form.mode === 'text' ? 'active' : ''} onClick={() => set('mode','text')}><MessageCircle /> <span><b>Só texto</b><small>Perguntas e respostas escritas</small></span></button><button type="button" className={form.mode === 'audio' ? 'active' : ''} onClick={() => set('mode','audio')}><Volume2 /><span><b>Texto + áudio</b><small>Inclui notas de voz</small></span></button></div></fieldset>
      <label className="switch-row"><span><Link2 /><span><b>Sala pública</b><small>Visível para quem tiver o link</small></span></span><input type="checkbox" checked={form.isPublic} onChange={(e) => set('isPublic', e.target.checked)} /></label>
      <button className="button button--primary button--wide" disabled={busy}>{busy ? 'A criar…' : 'Criar sala'}</button>
    </form></GlassCard>
  </div>
}
