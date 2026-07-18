import { request } from './apiClient'
export const adApi = {
  impression: (payload) => request('/api/ad/impression', { method: 'POST', body: JSON.stringify(payload) }),
}
