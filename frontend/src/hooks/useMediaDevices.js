import { useCallback, useEffect, useRef, useState } from 'react'

export function useMediaDevices() {
  const streamRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [facingMode, setFacingMode] = useState('user')

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
  }, [])
  const start = useCallback(async (facing = facingMode) => {
    stop()
    try {
      const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: true })
      streamRef.current = next
      setStream(next)
      setError(null)
      return next
    } catch (err) {
      setError(err.name === 'NotAllowedError' ? 'permission' : 'device')
      throw err
    }
  }, [facingMode, stop])
  const toggleMute = () => { stream?.getAudioTracks().forEach((t) => { t.enabled = muted }); setMuted(!muted) }
  const toggleCamera = () => { stream?.getVideoTracks().forEach((t) => { t.enabled = cameraOff }); setCameraOff(!cameraOff) }
  const switchCamera = async () => { const facing = facingMode === 'user' ? 'environment' : 'user'; setFacingMode(facing); await start(facing) }
  useEffect(() => stop, [stop])
  return { stream, error, muted, cameraOff, start, stop, toggleMute, toggleCamera, switchCamera }
}
