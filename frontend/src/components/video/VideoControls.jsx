import { Camera, CameraOff, Flag, Mic, MicOff, PhoneOff, RefreshCw, SkipForward } from 'lucide-react'
export default function VideoControls({ muted, cameraOff, onMute, onCamera, onSwitch, onNext, onEnd, onReport, busy }) {
  return <div className="video-controls glass-card">
    <button onClick={onMute} aria-label={muted ? 'Activar microfone' : 'Desactivar microfone'}>{muted ? <MicOff /> : <Mic />}</button>
    <button onClick={onCamera} aria-label={cameraOff ? 'Activar câmara' : 'Desactivar câmara'}>{cameraOff ? <CameraOff /> : <Camera />}</button>
    <button className="mobile-only" onClick={onSwitch} aria-label="Trocar câmara"><RefreshCw /></button>
    <button className="next-button" onClick={onNext} disabled={busy}><SkipForward /><span>Próximo</span></button>
    <button onClick={onReport} aria-label="Denunciar utilizador"><Flag /></button>
    <button className="end-button" onClick={onEnd} aria-label="Terminar"><PhoneOff /></button>
  </div>
}
