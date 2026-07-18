import { request } from './apiClient'

export const roomApi = {
  initUser: () => request('/api/users/anonymous'),
  create: (payload) => request('/api/rooms', { method: 'POST', body: JSON.stringify(payload) }),
  get: (uuid) => request(`/api/rooms/${uuid}`),
  sendMessage: (uuid, payload) => request(`/api/rooms/${uuid}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
}
