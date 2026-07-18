import { useCallback, useEffect, useRef, useState } from 'react'
import { createStompClient } from '../services/websocketService'

export function useRoomSocket(roomUuid, user, onMessage) {
  const clientRef = useRef(null)
  const callbackRef = useRef(onMessage)
  const [status, setStatus] = useState('connecting')
  callbackRef.current = onMessage

  useEffect(() => {
    if (!roomUuid || !user) return
    const client = createStompClient({
      onConnect: () => {
        setStatus('connected')
        client.subscribe(`/topic/room/${roomUuid}/messages`, (frame) => callbackRef.current(JSON.parse(frame.body)))
      },
      onDisconnect: () => setStatus('reconnecting'),
      onError: () => setStatus('disconnected'),
    })
    clientRef.current = client
    client.activate()
    return () => { client.deactivate(); clientRef.current = null }
  }, [roomUuid, user])

  const send = useCallback((text, inReplyTo) => {
    if (!clientRef.current?.connected) throw new Error('A ligação ainda não está pronta.')
    clientRef.current.publish({
      destination: '/app/room.message',
      body: JSON.stringify({ roomUuid, authorUuid: user.uuid, text, inReplyTo: inReplyTo || null }),
    })
  }, [roomUuid, user])
  return { status, send }
}
