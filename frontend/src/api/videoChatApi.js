import { request } from './apiClient'
export const videoChatApi = { init: () => request('/api/video/session') }
