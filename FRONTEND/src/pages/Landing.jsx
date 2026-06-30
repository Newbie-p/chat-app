import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [hover1, setHover1] = useState(false)
  const [hover2, setHover2] = useState(false)

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#EDE8DF', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Navbar */}
      <nav style={{ background: '#1A1510', borderBottom: '1px solid #2C2318', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '18px', color: '#EDE8DF', fontWeight: 600, letterSpacing: '0.01em' }}>
            ChatSpace
          </span>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="desktop-nav">
            <button onClick={() => navigate('/login')} style={{ fontSize: '13px', color: '#9B8E80', background: 'transparent', border: '1px solid #2C2318', borderRadius: '6px', padding: '7px 16px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
              Login
            </button>
            <button onClick={() => navigate('/register')} style={{ fontSize: '13px', color: '#1A1510', background: '#B87420', border: 'none', borderRadius: '6px', padding: '7px 18px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
              Get started
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-nav"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EDE8DF', fontSize: '22px', padding: '4px', display: 'none' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu" style={{ padding: '12px 20px 16px', borderTop: '1px solid #2C2318', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => navigate('/login')} style={{ fontSize: '14px', color: '#9B8E80', background: 'transparent', border: '1px solid #2C2318', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'left' }}>
              Login
            </button>
            <button onClick={() => navigate('/register')} style={{ fontSize: '14px', color: '#1A1510', background: '#B87420', border: 'none', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, textAlign: 'left' }}>
              Get started
            </button>
          </div>
        )}
      </nav>

      {/* Body */}
      <div className="body-grid" style={{ display: 'flex', flex: 1 }}>

        {/* Left */}
        <div className="left-panel" style={{ width: '50%', flexShrink: 0, padding: '48px 40px 36px', borderRight: '1px solid #CFC8BE', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 600, color: '#9B8E80', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '18px', fontFamily: 'JetBrains Mono, monospace' }}>
              Real-time messaging
            </p>
            <h1 style={{ fontSize: '34px', fontWeight: 300, color: '#1A1510', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '12px', fontStyle: 'italic' }}>
              Built for<br />
              <strong style={{ fontWeight: 600, fontStyle: 'normal' }}>developers</strong><br />
              who just want<br />
              to <strong style={{ fontWeight: 600, fontStyle: 'normal' }}>ship.</strong>
            </h1>
            <p style={{ fontSize: '13px', color: '#7A6E62', lineHeight: 1.7, maxWidth: '300px', marginBottom: '32px' }}>
              Create a room, share a code, start talking. No friction — real-time chat backed by Socket.io and Redis.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
              <button
                onClick={() => navigate('/register')}
                onMouseEnter={() => setHover1(true)}
                onMouseLeave={() => setHover1(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '13px 18px',
                  background: hover1 ? '#B87420' : 'transparent',
                  borderRadius: '8px', cursor: 'pointer',
                  border: '1.5px solid #B87420',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                  <span style={{ fontSize: '13px', color: hover1 ? '#1A1510' : '#B87420', fontWeight: 500, transition: 'color 0.15s ease' }}>Create a room</span>
                  <span style={{ fontSize: '10px', color: hover1 ? '#1A1510' : '#9B8E80', fontFamily: 'JetBrains Mono, monospace', transition: 'color 0.15s ease' }}>new · get a shareable code</span>
                </div>
                <span style={{ fontSize: '15px', color: hover1 ? '#1A1510' : '#B87420', fontWeight: 600, transition: 'color 0.15s ease' }}>→</span>
              </button>

              <button
                onClick={() => navigate('/login')}
                onMouseEnter={() => setHover2(true)}
                onMouseLeave={() => setHover2(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '13px 18px',
                  background: hover2 ? '#B87420' : 'transparent',
                  borderRadius: '8px', cursor: 'pointer',
                  border: '1.5px solid #B87420',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                  <span style={{ fontSize: '13px', color: hover2 ? '#1A1510' : '#B87420', fontWeight: 500, transition: 'color 0.15s ease' }}>Join with a code</span>
                  <span style={{ fontSize: '10px', color: hover2 ? '#1A1510' : '#9B8E80', fontFamily: 'JetBrains Mono, monospace', transition: 'color 0.15s ease' }}>e.g. GH7K2M91</span>
                </div>
                <span style={{ fontSize: '15px', color: hover2 ? '#1A1510' : '#B87420', fontWeight: 600, transition: 'color 0.15s ease' }}>→</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: '#CFC8BE', border: '1px solid #CFC8BE', borderRadius: '8px', overflow: 'hidden' }}>
            {[{ num: '<5ms', label: 'avg latency' }, { num: 'Redis', label: 'presence' }, { num: '∞', label: 'rooms' }].map((s) => (
              <div key={s.label} style={{ background: '#EDE8DF', padding: '12px 14px' }}>
                <div style={{ fontSize: '17px', fontWeight: 600, color: '#1A1510', letterSpacing: '-0.02em', fontFamily: 'JetBrains Mono, monospace' }}>{s.num}</div>
                <div style={{ fontSize: '10px', color: '#9B8E80', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Chat Preview */}
        <div className="right-panel" style={{ flex: 1, background: '#17140F', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Room Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: '1px solid #2C2720', flexShrink: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '13px', color: '#B87420', fontWeight: 600 }}>#</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#EDE8DF' }}>backend</span>
              </div>
              <span style={{ fontSize: '10px', color: '#3A3028', fontFamily: 'JetBrains Mono, monospace' }}>GH7K2M91 · share to invite</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex' }}>
                {[{ bg: '#5E4A8C', color: '#EDE8DF', l: 'A' }, { bg: '#3A5E8C', color: '#EDE8DF', l: 'B' }, { bg: '#B87420', color: '#17140F', l: 'P' }].map((av, i) => (
                  <div key={av.l} style={{ width: '20px', height: '20px', borderRadius: '50%', background: av.bg, border: '1.5px solid #17140F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 600, color: av.color, marginLeft: i === 0 ? 0 : '-5px' }}>
                    {av.l}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '11px', color: '#4A4038', marginLeft: '8px' }}>3 online</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
            <Msg av={{ bg: '#5E4A8C', color: '#EDE8DF', l: 'A' }} name="alice" time="11:14">
              deployment just failed on Railway — <Code>ECONNREFUSED</Code> on Redis again
            </Msg>
            <Msg av={{ bg: '#3A5E8C', color: '#EDE8DF', l: 'B' }} name="bob" time="11:15">
              check your <Code>REDIS_URL</Code> env var — probably has quotes around it
            </Msg>
            <Cont>happened to me last week, Railway strips them weirdly</Cont>
            <Msg av={{ bg: '#B87420', color: '#17140F', l: 'P' }} name="praful" time="11:16" isMe>
              also set <Code>maxRetriesPerRequest: null</Code> — fixes silent reconnect failures
            </Msg>
            <Msg av={{ bg: '#5E4A8C', color: '#EDE8DF', l: 'A' }} name="alice" time="11:17">
              oh it was the quotes lol. pushing fix now 🙏
            </Msg>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '37px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {['#4A4038', '#3A3028', '#2C2720'].map((bg, i) => (
                  <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: bg }} />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: '#3A3028', fontFamily: 'JetBrains Mono, monospace' }}>bob is typing</span>
            </div>
          </div>

          {/* Input */}
          <div style={{ padding: '10px 18px 14px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#211D17', border: '1px solid #2C2720', borderRadius: '7px', padding: '8px 10px 8px 13px' }}>
              <span style={{ flex: 1, fontSize: '12.5px', color: '#3A3028', fontFamily: 'Inter, system-ui, sans-serif' }}>Message #backend</span>
              <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: '#B87420', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#17140F', fontSize: '13px' }}>↑</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: block !important; }
          .body-grid { flex-direction: column !important; }
          .left-panel {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid #CFC8BE;
            padding: 32px 20px 28px !important;
          }
          .right-panel { min-height: 420px; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function Msg({ av, name, time, isMe, children }) {
  return (
    <div style={{ display: 'flex', gap: '9px', marginBottom: '10px' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, flexShrink: 0, marginTop: '1px' }}>
        {av.l}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', marginBottom: '2px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: isMe ? '#B87420' : '#7A7068' }}>{name}</span>
          <span style={{ fontSize: '10px', color: '#2C2720', fontFamily: 'JetBrains Mono, monospace' }}>{time}</span>
        </div>
        <div style={{ fontSize: '12.5px', color: '#8C8480', lineHeight: 1.55 }}>{children}</div>
      </div>
    </div>
  )
}

function Cont({ children }) {
  return (
    <div style={{ paddingLeft: '37px', marginBottom: '10px', fontSize: '12.5px', color: '#8C8480', lineHeight: 1.55 }}>
      {children}
    </div>
  )
}

function Code({ children }) {
  return (
    <code style={{ background: '#211D17', border: '1px solid #2C2720', borderRadius: '3px', padding: '1px 5px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#B87420' }}>
      {children}
    </code>
  )
}