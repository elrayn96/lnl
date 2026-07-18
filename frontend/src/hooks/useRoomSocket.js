import { useCallback, useEffect, useRef, useState } from 'react'
import { createStompClient } from '../services/websocketService'

export function useRoomSocket(roomUuid, user, onMessage) {
  const clientRef = useRef(null)
  const callbackRef = useRef(onMessage)
  const [status, setStatus] = useState('connecting')
  callbackRef.current = onMessage

  useEffect(() => {
    if (!roomUuid || !user) return
    let active = true
    let subscription
    const client = createStompClient({
      onConnect: () => {
        if (!active || clientRef.current !== client) return
        setStatus('connected')
        subscription = client.subscribe(`/topic/room/${roomUuid}/messages`, (frame) => {
          if (!active) return
          try { callbackRef.current(JSON.parse(frame.body)) } catch { setStatus('disconnected') }
        })
      },
      onDisconnect: () => {
        if (active && clientRef.current === client) setStatus('reconnecting')
      },
      onError: () => {
        if (active && clientRef.current === client) setStatus('disconnected')
      },
    })
    client.connectionTimeout = 10000
    clientRef.current = client
    client.activate()
    return () => {
      active = false
      subscription?.unsubscribe()
      if (clientRef.current === client) clientRef.current = null
      client.deactivate({ force: true })
    }
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
