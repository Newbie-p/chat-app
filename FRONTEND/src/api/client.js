const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const request = async (method, path, body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export const api = {
  // Auth
  register: (body) => request('POST', '/api/auth/register', body),
  login: (body) => request('POST', '/api/auth/login', body),
  getMe: (token) => request('GET', '/api/auth/me', null, token),

  // Rooms
  createRoom: (body, token) => request('POST', '/api/rooms/create', body, token),
  joinRoom: (body, token) => request('POST', '/api/rooms/join', body, token),
  getMyRooms: (token) => request('GET', '/api/rooms/me', null, token),
  getRoomById: (roomId, token) => request('GET', `/api/rooms/${roomId}`, null, token),
  getMessages: (roomId, token, cursor = null) => {
    const query = cursor ? `?cursor=${cursor}&limit=50` : '?limit=50'
    return request('GET', `/api/rooms/${roomId}/messages${query}`, null, token)
  },
}