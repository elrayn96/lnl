import { Camera, Radio, ShieldAlert } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { reportApi } from '../api/reportApi'
import { videoChatApi } from '../api/videoChatApi'
import NextAdOverlay from '../components/ads/NextAdOverlay'
import StateView from '../components/common/StateView'
import ReportDialog from '../components/video/ReportDialog'
import VideoControls from '../components/video/VideoControls'
import { useToast } from '../contexts/ToastContext'
import { useMediaDevices } from '../hooks/useMediaDevices'
import { useRandomMatch } from '../hooks/useRandomMatch'

const labels = { searching: 'A procurar alguém…', connecting: 'Ligação encontrada. A conectar…', reconnecting: 'A recuperar a ligação…', 'peer-left': 'A outra pessoa saiu.', failed: 'Não foi possível estabelecer a ligação.' }
export default function VideoChatPage() {
  const localVideo = useRef(null), remoteVideo = useRef(null)
  const [session, setSession] = useState(null), [ad, setAd] = useState(false), [report, setReport] = useState(false)
  const media = useMediaDevices()
  const match = useRandomMatch(media.stream)
  const navigate = useNavigate(), toast = useToast()
  useEffect(() => { videoChatApi.init().then(setSession).catch((e) => toast.show(e.message, 'error')); media.start().catch(() => {}) }, [])
  useEffect(() => { if (media.stream && localVideo.current) localVideo.current.srcObject = media.stream; if (media.stream && match.status === 'idle' && !ad) match.connect() }, [media.stream, match.status, ad])
  useEffect(() => { if (remoteVideo.current) remoteVideo.current.srcObject = match.remoteStream }, [match.remoteStream])
  const finishAd = useCallback(() => { setAd(false); match.connect() }, [match])
  const next = async () => { await match.disconnect(); setAd(true) }
  const end = async () => { await match.disconnect(); media.stop(); navigate('/') }
  const submitReport = async (reason) => { try { await reportApi.send({ sessionUUID: session?.sessionUUID, reason }); toast.show('Denúncia recebida. Obrigado por ajudares a manter a comunidade segura.'); setReport(false); next() } catch (e) { toast.show(e.message, 'error') } }
  if (media.error) return <div className="video-page"><StateView tone="error" title="Precisamos da câmara e do microfone" message="Autoriza o acesso nas definições do navegador para iniciar uma conversa." action={<button className="button button--primary" onClick={() => media.start()}><Camera /> Tentar novamente</button>} /></div>
  return <div className="video-page">
    <div className="video-topbar"><span className="brand-mini">Link&Live</span><span className={`connection-pill connection-pill--${match.status}`}><i /> {match.status === 'connected' ? 'Ligado' : labels[match.status] || 'A preparar…'}</span><span className="safety"><ShieldAlert /> Conversa não gravada</span></div>
    <section className="video-stage">
      {match.remoteStream ? <video ref={remoteVideo} autoPlay playsInline className="remote-video" /> : <div className="match-placeholder"><span className="signal-rings"><Radio /></span><h1>{labels[match.status] || 'A preparar a tua câmara…'}</h1><p>{match.status === 'peer-left' ? 'Carrega em Próximo para continuar.' : 'Isto costuma demorar apenas alguns segundos.'}</p></div>}
      <div className="local-preview glass-card">{media.stream ? <video ref={localVideo} autoPlay muted playsInline /> : <span><Camera /> A iniciar</span>}<small>Tu</small></div>
      <VideoControls muted={media.muted} cameraOff={media.cameraOff} onMute={media.toggleMute} onCamera={media.toggleCamera} onSwitch={media.switchCamera} onNext={next} onEnd={end} onReport={() => setReport(true)} busy={ad} />
    </section>
    {ad && <NextAdOverlay onComplete={finishAd} />}
    {report && <ReportDialog onClose={() => setReport(false)} onSubmit={submitReport} />}
  </div>
}
