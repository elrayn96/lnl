import { request } from './apiClient'
export const reportApi = {
  send: (payload) => request('/api/reports', { method: 'POST', body: JSON.stringify(payload) }),
}
