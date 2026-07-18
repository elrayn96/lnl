import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function createStompClient({ onConnect, onDisconnect, onError }) {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL || ''}/ws`),
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect,
    onWebSocketClose: onDisconnect,
    onWebSocketError: onError,
    onStompError: onError,
    debug: import.meta.env.DEV ? () => {} : undefined,
  })
  return client
}
