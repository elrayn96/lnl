import { useCallback, useEffect, useRef, useState } from 'react'
import { createStompClient } from '../services/websocketService'

const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  ...(import.meta.env.VITE_TURN_URL ? [{ urls: import.meta.env.VITE_TURN_URL, username: import.meta.env.VITE_TURN_USERNAME, credential: import.meta.env.VITE_TURN_CREDENTIAL }] : []),
]

export function useRandomMatch(localStream) {
  const stompRef = useRef(null)
  const peerRef = useRef(null)
  const candidatesRef = useRef([])
  const remoteReadyRef = useRef(false)
  const [remoteStream, setRemoteStream] = useState(null)
  const [status, setStatus] = useState('idle')

  const closePeer = useCallback(() => {
    peerRef.current?.close()
    peerRef.current = null
    candidatesRef.current = []
    remoteReadyRef.current = false
    setRemoteStream(null)
  }, [])
  const disconnect = useCallback(async () => {
    closePeer()
    const client = stompRef.current
    stompRef.current = null
    if (client) await client.deactivate()
    setStatus('idle')
  }, [closePeer])
  const sendSignal = (data) => stompRef.current?.publish({ destination: '/app/video.signal', body: JSON.stringify(data) })
  const createPeer = useCallback(async (initiator) => {
    closePeer()
    const peer = new RTCPeerConnection({ iceServers })
    peerRef.current = peer
    localStream.getTracks().forEach((track) => peer.addTrack(track, localStream))
    peer.ontrack = (event) => { setRemoteStream(event.streams[0]); setStatus('connected') }
    peer.onicecandidate = ({ candidate }) => candidate && sendSignal({ type: 'candidate', data: candidate.toJSON() })
    peer.onconnectionstatechange = () => {
      if (['failed', 'disconnected', 'closed'].includes(peer.connectionState)) setStatus('peer-left')
    }
    if (initiator) {
      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)
      sendSignal({ type: 'offer', data: peer.localDescription.toJSON() })
    }
  }, [closePeer, localStream])
  const handleSignal = useCallback(async (signal) => {
    if (signal.type === 'peerLeft') { closePeer(); setStatus('peer-left'); return }
    const peer = peerRef.current
    if (!peer) return
    if (signal.type === 'offer') {
      await peer.setRemoteDescription(signal.data); remoteReadyRef.current = true
      await Promise.all(candidatesRef.current.splice(0).map((x) => peer.addIceCandidate(x)))
      const answer = await peer.createAnswer(); await peer.setLocalDescription(answer)
      sendSignal({ type: 'answer', data: peer.localDescription.toJSON() })
    } else if (signal.type === 'answer' && peer.signalingState !== 'stable') {
      await peer.setRemoteDescription(signal.data); remoteReadyRef.current = true
      await Promise.all(candidatesRef.current.splice(0).map((x) => peer.addIceCandidate(x)))
    } else if (signal.type === 'candidate') {
      if (remoteReadyRef.current) await peer.addIceCandidate(signal.data)
      else candidatesRef.current.push(signal.data)
    }
  }, [closePeer])
  const connect = useCallback(() => {
    if (!localStream || stompRef.current) return
    setStatus('searching')
    const client = createStompClient({
      onConnect: () => {
        client.subscribe('/topic/welcome-ack', (message) => {
          const id = message.body
          client.subscribe(`/topic/pair/${id}`, async (frame) => {
            setStatus('connecting')
            const pair = JSON.parse(frame.body)
            await createPeer(pair.initiator)
          })
          client.subscribe(`/topic/signal/${id}`, (frame) => handleSignal(JSON.parse(frame.body)).catch(() => setStatus('failed')))
          client.publish({ destination: '/app/video.join', body: '' })
        })
        client.publish({ destination: '/app/get-session-id', body: '' })
      },
      onDisconnect: () => setStatus((s) => s === 'idle' ? s : 'reconnecting'),
      onError: () => setStatus('failed'),
    })
    stompRef.current = client
    client.activate()
  }, [createPeer, handleSignal, localStream])
  useEffect(() => disconnect, [disconnect])
  return { remoteStream, status, connect, disconnect }
}
