import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { connectSocket, disconnectSocket } from '../socket/socket'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ color, letter, size = 32, fontSize = 12 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize, fontWeight: 600,
      color: getTextColor(color), flexShrink: 0,
    }}>
      {letter?.charAt(0).toUpperCase()}
    </div>
  )
}

function getTextColor(bg) {
  const light = ['#B87420', '#EDE8DF', '#CFC8BE']
  return light.includes(bg) ? '#1A1510' : '#EDE8DF'
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Sort members: online first, then alphabetically within each group
function sortMembers(members) {
  return [...members].sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1
    return a.username.localeCompare(b.username)
  })
}

// ─── Main Chat Page ────────────────────────────────────────────────────────────

export default function Chat() {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState(null)
  const [codeCopied, setCodeCopied] = useState(false)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)
  const activeRoomRef = useRef(null)

  useEffect(() => {
    activeRoomRef.current = activeRoom
  }, [activeRoom])

  // Load rooms on mount
  useEffect(() => {
    api.getMyRooms(token).then(data => setRooms(data.rooms || []))
  }, [token])

  // Socket setup — StrictMode-safe (guards against double-mount in dev)
  useEffect(() => {
    let cancelled = false
    const socket = connectSocket(token)
    socketRef.current = socket

    const onMessageNew = (msg) => {
      if (cancelled) return
      setMessages(prev => [...prev, msg])
      // Clear typing indicator for the sender once their message arrives
      setTypingUsers(prev => prev.filter(u => u !== msg.sender?.username))
    }

    const onRoomMembers = (membersList) => {
      if (cancelled) return
      setMembers(sortMembers(membersList))
    }

    const onTypingStart = ({ username }) => {
      if (cancelled) return
      setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username])
    }

    const onTypingStop = ({ username }) => {
      if (cancelled) return
      setTypingUsers(prev => prev.filter(u => u !== username))
    }

    const onError = (err) => {
      console.error('Socket error:', err.message)
    }

    socket.on('message:new', onMessageNew)
    socket.on('room:members', onRoomMembers)
    socket.on('typing:start', onTypingStart)
    socket.on('typing:stop', onTypingStop)
    socket.on('error', onError)

    return () => {
      cancelled = true
      socket.off('message:new', onMessageNew)
      socket.off('room:members', onRoomMembers)
      socket.off('typing:start', onTypingStart)
      socket.off('typing:stop', onTypingStop)
      socket.off('error', onError)
    }
  }, [token])

  // Join room via socket + load messages
  const joinRoom = useCallback(async (room) => {
    setActiveRoom(room)
    setMessages([])
    setMembers([])
    setTypingUsers([])
    setCursor(null)
    setHasMore(false)
    setSidebarOpen(false)
    setMembersOpen(false)

    const data = await api.getMessages(room.id, token)
    setMessages(data.messages || [])
    setCursor(data.nextCursor)
    setHasMore(data.hasMore)

    socketRef.current?.emit('room:join', { roomId: room.id })
  }, [token])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  // Load more messages (pagination)
  const loadMore = async () => {
    if (!cursor || loadingMore || !activeRoom) return
    setLoadingMore(true)
    const data = await api.getMessages(activeRoom.id, token, cursor)
    setMessages(prev => [...(data.messages || []), ...prev])
    setCursor(data.nextCursor)
    setHasMore(data.hasMore)
    setLoadingMore(false)
  }

  // Send message
  const sendMessage = () => {
    if (!input.trim() || !activeRoom) return
    socketRef.current?.emit('message:send', { roomId: activeRoom.id, content: input.trim() })
    setInput('')
    stopTyping()
  }

  // Typing indicators
  const startTyping = () => {
    if (!isTypingRef.current && activeRoomRef.current) {
      isTypingRef.current = true
      socketRef.current?.emit('typing:start', { roomId: activeRoomRef.current.id })
    }
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(stopTyping, 2000)
  }

  const stopTyping = () => {
    if (isTypingRef.current && activeRoomRef.current) {
      isTypingRef.current = false
      socketRef.current?.emit('typing:stop', { roomId: activeRoomRef.current.id })
    }
    clearTimeout(typingTimeoutRef.current)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleLogout = () => {
    stopTyping()
    disconnectSocket()
    logout()
    navigate('/')
  }

  const handleCopyCode = async () => {
    if (!activeRoom) return
    try {
      await navigator.clipboard.writeText(activeRoom.code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 1500)
    } catch {
      // clipboard not available — fail silently
    }
  }

  const onlineCount = members.filter(m => m.online).length

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#EDE8DF', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>

      {/* Mobile top bar */}
      <div className="mobile-topbar" style={{ display: 'none', background: '#1A1510', padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid #2C2318' }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#EDE8DF', fontSize: '20px', cursor: 'pointer', padding: '2px' }}>
          ☰
        </button>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '15px', color: '#EDE8DF', fontWeight: 600 }}>
          {activeRoom ? `#${activeRoom.name}` : 'ChatSpace'}
        </span>
        <button onClick={() => setMembersOpen(true)} style={{ background: 'transparent', border: 'none', color: '#9B8E80', fontSize: '13px', cursor: 'pointer' }}>
          {onlineCount} online
        </button>
      </div>

      {/* Main layout */}
      <div className="main-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative',  width: '100%', margin: '0 auto' }}>

        {/* Sidebar overlay (mobile) */}
        {(sidebarOpen || membersOpen) && (
          <div onClick={() => { setSidebarOpen(false); setMembersOpen(false) }} className="panel-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, display: 'none' }} />
        )}

        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} style={{ width: '230px', flexShrink: 0, background: '#EFEBE3', borderRight: '1px solid #D0C8BE', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* App header */}
          <div style={{ padding: '14px', borderBottom: '1px solid #D0C8BE', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1C1612', fontFamily: 'JetBrains Mono, monospace', marginBottom: '10px' }}>ChatSpace</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 8px', background: '#E4DDD3', borderRadius: '6px' }}>
                <Avatar color={user?.avatarColor || '#B87420'} letter={user?.username} size={24} fontSize={10} />
                <span style={{ fontSize: '12px', color: '#5C5046', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.username}
                </span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="close-btn-mobile" style={{ display: 'none', background: 'transparent', border: 'none', color: '#8C7E72', fontSize: '18px', cursor: 'pointer', padding: '4px', marginLeft: '8px', flexShrink: 0 }}>✕</button>
          </div>

          {/* Rooms header */}
          <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#8C7E72', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rooms</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setShowCreateModal(true)} title="Create room" style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#E4DDD3', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6B5E52', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              <button onClick={() => setShowJoinModal(true)} title="Join room" style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#E4DDD3', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#6B5E52', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace' }}>#</button>
            </div>
          </div>

          {/* Room list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '2px 8px' }}>
            {rooms.length === 0 ? (
              <div style={{ padding: '16px 8px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#9B8E80', lineHeight: 1.5 }}>No rooms yet.</p>
                <p style={{ fontSize: '11px', color: '#B0A090', marginTop: '4px' }}>Create or join one above.</p>
              </div>
            ) : rooms.map(room => (
              <div
                key={room.id}
                onClick={() => joinRoom(room)}
                style={{
                  padding: '7px 8px', borderRadius: '5px', cursor: 'pointer',
                  marginBottom: '1px',
                  background: activeRoom?.id === room.id ? '#E4DDD3' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '13px', color: activeRoom?.id === room.id ? '#B87420' : '#8C7E72' }}>#</span>
                  <span style={{ fontSize: '13px', color: activeRoom?.id === room.id ? '#1A1510' : '#4A3F34', fontWeight: activeRoom?.id === room.id ? 500 : 400 }}>{room.name}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#9B8E80', marginTop: '1px', fontFamily: 'JetBrains Mono, monospace' }}>{room.memberCount} members</div>
              </div>
            ))}
          </div>

          {/* Logout */}
          <div style={{ padding: '10px', borderTop: '1px solid #D0C8BE', flexShrink: 0 }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                background: '#E4DDD3', border: '1px solid #D0C8BE', borderRadius: '7px',
                cursor: 'pointer', padding: '9px 12px', width: '100%',
                transition: 'background 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F0DCC8'; e.currentTarget.style.borderColor = '#B87420' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#E4DDD3'; e.currentTarget.style.borderColor = '#D0C8BE' }}
            >
              <span style={{ fontSize: '13px' }}>⎋</span>
              <span style={{ fontSize: '12px', color: '#5C5046', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}>Logout</span>
            </button>
          </div>
        </div>

        {/* Chat Window */}
        <div style={{ flex: 1, background: '#17140F', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {activeRoom ? (
            <>
              {/* Room header */}
              <div style={{ padding: '12px 18px', borderBottom: '1px solid #2C2720', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', color: '#B87420', fontWeight: 600 }}>#</span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#EDE8DF' }}>{activeRoom.name}</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    title="Click to copy room code"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      padding: '2px 0', marginTop: '2px',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: '#9B8E80', fontFamily: 'JetBrains Mono, monospace' }}>
                      {activeRoom.code}
                    </span>
                    <span style={{ fontSize: '10px', color: '#7A6E62' }}>·</span>
                    <span style={{ fontSize: '11px', color: codeCopied ? '#6B9E5A' : '#7A6E62', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {codeCopied ? (
                        <>✓ copied</>
                      ) : (
                        <>⧉ copy to share</>
                      )}
                    </span>
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6B9E5A' }} />
                  <span style={{ fontSize: '11px', color: '#9B8E80' }}>{onlineCount} online</span>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px', display: 'flex', flexDirection: 'column' }}>

                {hasMore && (
                  <button onClick={loadMore} disabled={loadingMore} style={{ alignSelf: 'center', margin: '0 0 12px', padding: '6px 14px', background: 'transparent', border: '1px solid #2C2720', borderRadius: '20px', fontSize: '11px', color: '#9B8E80', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace' }}>
                    {loadingMore ? 'Loading…' : 'Load older messages'}
                  </button>
                )}

                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '24px', marginBottom: '8px' }}>#</p>
                      <p style={{ fontSize: '13px', color: '#5C5046' }}>Start the conversation in <span style={{ color: '#B87420' }}>#{activeRoom.name}</span></p>
                    </div>
                  </div>
                ) : (
                  <MessageList messages={messages} currentUserId={user?.id} />
                )}

                {typingUsers.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '37px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6B5E52' }} />)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#7A6E62', fontFamily: 'JetBrains Mono, monospace' }}>
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '10px 18px 14px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#211D17', border: '1px solid #2C2720', borderRadius: '8px', padding: '10px 10px 10px 14px' }}>
                  <input
                    value={input}
                    onChange={(e) => { setInput(e.target.value); startTyping() }}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message #${activeRoom.name}`}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#D4C9BC', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }}
                  />
                  <button onClick={sendMessage} disabled={!input.trim()} style={{ width: '28px', height: '28px', borderRadius: '6px', background: input.trim() ? '#B87420' : '#2C2720', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s ease' }}>
                    <span style={{ color: input.trim() ? '#1A1510' : '#5C5046', fontSize: '14px' }}>↑</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ fontSize: '28px', marginBottom: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#3A3028' }}>#</p>
                <p style={{ fontSize: '14px', color: '#9B8E80', marginBottom: '6px' }}>Select a room to start chatting</p>
                <p style={{ fontSize: '12px', color: '#5C5046', fontFamily: 'JetBrains Mono, monospace' }}>or create / join a new one</p>
              </div>
            </div>
          )}
        </div>

        {/* Members Panel */}
        <div className={`members-panel ${membersOpen ? 'members-open' : ''}`} style={{ width: '230px', flexShrink: 0, background: '#EFEBE3', borderLeft: '1px solid #D0C8BE', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid #D0C8BE' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#8C7E72', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Members — {members.length}
            </span>
            <button onClick={() => setMembersOpen(false)} className="close-btn-mobile" style={{ display: 'none', background: 'transparent', border: 'none', color: '#8C7E72', fontSize: '18px', cursor: 'pointer', padding: '2px' }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {members.length === 0 ? (
              <p style={{ fontSize: '11px', color: '#9B8E80' }}>No members yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {members.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar color={m.avatarColor || '#B87420'} letter={m.username} size={26} fontSize={10} />
                      <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '8px', height: '8px', borderRadius: '50%', background: m.online ? '#6B9E5A' : '#9B8E80', border: '1.5px solid #EFEBE3' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: m.id === user?.id ? '#B87420' : '#3A3028', fontFamily: 'JetBrains Mono, monospace', fontWeight: m.id === user?.id ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.username}{m.id === user?.id && ' (you)'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && <CreateRoomModal token={token} onClose={() => setShowCreateModal(false)} onCreated={(room) => { setRooms(prev => [room, ...prev]); setShowCreateModal(false); joinRoom(room) }} />}

      {showJoinModal && <JoinRoomModal token={token} onClose={() => setShowJoinModal(false)} onJoined={(room) => { setRooms(prev => prev.find(r => r.id === room.id) ? prev : [room, ...prev]); setShowJoinModal(false); joinRoom(room) }} />}

      <style>{`
        @media (max-width: 768px) {
          .mobile-topbar { display: flex !important; }
          .close-btn-mobile { display: flex !important; align-items: center; justify-content: center; }
          .sidebar {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            width: 260px !important;
          }
          .sidebar-open { transform: translateX(0) !important; }
          .members-panel {
            position: fixed !important;
            top: 0; right: 0; bottom: 0;
            z-index: 50;
            transform: translateX(100%);
            transition: transform 0.25s ease;
            width: 220px !important;
          }
          .members-open { transform: translateX(0) !important; }
          .panel-overlay { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-topbar { display: none !important; }
          .sidebar { position: relative !important; transform: none !important; }
          .members-panel { position: relative !important; transform: none !important; }
        }
        @media (min-width: 1200px) {
          .sidebar { width: 260px !important; }
          .members-panel { width: 220px !important; }
        }
        input::placeholder { color: #5C5046; }
      `}</style>
    </div>
  )
}

// ─── Message List ──────────────────────────────────────────────────────────────

function MessageList({ messages, currentUserId }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {messages.map((msg, i) => {
        const prev = messages[i - 1]
        const isGrouped = prev && prev.sender?.id === msg.sender?.id &&
          new Date(msg.createdAt) - new Date(prev.createdAt) < 5 * 60 * 1000

        if (isGrouped) {
          return (
            <div key={msg.id} style={{ paddingLeft: '41px', marginBottom: '3px' }}>
              <div style={{ fontSize: '13px', color: '#A89E94', lineHeight: 1.55 }}>{msg.content}</div>
            </div>
          )
        }

        return (
          <div key={msg.id} style={{ display: 'flex', gap: '9px', marginBottom: '10px', marginTop: i === 0 ? 0 : '4px' }}>
            <Avatar color={msg.sender?.avatarColor || '#B87420'} letter={msg.sender?.username} size={28} fontSize={10} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', marginBottom: '2px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: msg.sender?.id === currentUserId ? '#B87420' : '#A89E94' }}>
                  {msg.sender?.username || 'Unknown'}
                </span>
                <span style={{ fontSize: '10px', color: '#6B5E52', fontFamily: 'JetBrains Mono, monospace' }}>
                  {formatTime(msg.createdAt)}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#A89E94', lineHeight: 1.55, wordBreak: 'break-word' }}>{msg.content}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Create Room Modal ─────────────────────────────────────────────────────────

function CreateRoomModal({ token, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const data = await api.createRoom({ name: name.trim() }, token)
      onCreated(data.room)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return <Modal title="Create a room" onClose={onClose}>
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#7A6E62', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Room name</label>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. backend, general" required style={{ width: '100%', padding: '10px 13px', fontSize: '13px', background: '#EDE8DF', border: '1.5px solid #CFC8BE', borderRadius: '7px', outline: 'none', color: '#1A1510', fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box' }} />
      </div>
      {error && <p style={{ fontSize: '12px', color: '#8C3A1A' }}>{error}</p>}
      <button type="submit" disabled={loading} style={{ padding: '10px 18px', background: '#1A1510', color: '#EDE8DF', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {loading ? 'Creating…' : 'Create room'}
      </button>
    </form>
  </Modal>
}

// ─── Join Room Modal ───────────────────────────────────────────────────────────

function JoinRoomModal({ token, onClose, onJoined }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    try {
      const data = await api.joinRoom({ code: code.trim().toUpperCase() }, token)
      onJoined(data.room)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return <Modal title="Join a room" onClose={onClose}>
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#7A6E62', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Room code</label>
        <input autoFocus value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. GH7K2M91" required style={{ width: '100%', padding: '10px 13px', fontSize: '13px', background: '#EDE8DF', border: '1.5px solid #CFC8BE', borderRadius: '7px', outline: 'none', color: '#1A1510', fontFamily: 'JetBrains Mono, monospace', boxSizing: 'border-box', letterSpacing: '0.08em' }} />
      </div>
      {error && <p style={{ fontSize: '12px', color: '#8C3A1A' }}>{error}</p>}
      <button type="submit" disabled={loading} style={{ padding: '10px 18px', background: '#1A1510', color: '#EDE8DF', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {loading ? 'Joining…' : 'Join room'}
      </button>
    </form>
  </Modal>
}

// ─── Modal Wrapper ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#F5F0E8', borderRadius: '10px', padding: '24px', width: '100%', maxWidth: '360px', border: '1px solid #D0C8BE' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1510' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9B8E80', padding: '2px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}