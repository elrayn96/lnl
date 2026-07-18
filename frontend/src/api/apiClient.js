const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    throw new ApiError('Não foi possível contactar o servidor. Verifica se o backend está activo.', 0, {
      cause: error.message,
    })
  }
  if (!response.ok) {
    let details
    try { details = await response.json() } catch { details = null }
    throw new ApiError(
      details?.message || `Não foi possível concluir o pedido (HTTP ${response.status}).`,
      response.status,
      details,
    )
  }
  if (response.status === 204) return null
  const type = response.headers.get('content-type') || ''
  return type.includes('json') ? response.json() : response.text()
}
