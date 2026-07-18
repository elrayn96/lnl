const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    let details
    try { details = await response.json() } catch { details = null }
    throw new ApiError(details?.message || 'Não foi possível concluir o pedido.', response.status, details)
  }
  if (response.status === 204) return null
  const type = response.headers.get('content-type') || ''
  return type.includes('json') ? response.json() : response.text()
}
