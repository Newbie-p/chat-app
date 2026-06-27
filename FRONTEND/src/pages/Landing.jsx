import { useNavigate } from 'react-router-dom'

const S = {
  page: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: '#EDE8DF',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 40px',
    background: '#1A1510',
    borderBottom: '1px solid #2C2318',
    flexShrink: 0,
  },
  logo: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '13px',
    color: '#EDE8DF',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  navLogin: {
    fontSize: '13px',
    color: '#9B8E80',
    background: 'transparent',
    border: '1px solid #2C2318',
    borderRadius: '6px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  navCta: {
    fontSize: '13px',
    color: '#1A1510',
    background: '#B87420',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 16px',
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 600,
  },
  body: {
    display: 'flex',
    flex: 1,
  },
  left: {
    width: '50%',
    flexShrink: 0,
    padding: '48px 40px 36px',
    borderRight: '1px solid #CFC8BE',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#9B8E80',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '18px',
    fontFamily: 'JetBrains Mono, monospace',
  },
  headline: {
    fontSize: '34px',
    fontWeight: 300,
    color: '#1A1510',
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    marginBottom: '12px',
    fontStyle: 'italic',
  },
  subline: {
    fontSize: '13px',
    color: '#7A6E62',
    lineHeight: 1.7,
    maxWidth: '300px',
    marginBottom: '32px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '40px',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '13px 18px',
    background: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '1.5px solid #B87420',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  btnLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    textAlign: 'left',
  },
  btnText: {
    fontSize: '13px',
    color: '#B87420',
    fontWeight: 500,
  },
  btnSub: {
    fontSize: '10px',
    color: '#9B8E80',
    fontFamily: 'JetBrains Mono, monospace',
  },
  btnArrow: {
    fontSize: '15px',
    color: '#B87420',
    fontWeight: 600,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '1px',
    background: '#CFC8BE',
    border: '1px solid #CFC8BE',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  stat: {
    background: '#EDE8DF',
    padding: '12px 14px',
  },
  statNum: {
    fontSize: '17px',
    fontWeight: 600,
    color: '#1A1510',
    letterSpacing: '-0.02em',
    fontFamily: 'JetBrains Mono, monospace',
  },
  statLabel: {
    fontSize: '10px',
    color: '#9B8E80',
    marginTop: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  right: {
    flex: 1,
    background: '#17140F',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  roomHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '13px 18px',
    borderBottom: '1px solid #2C2720',
    flexShrink: 0,
  },
  roomInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  roomNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  rhash: {
    fontSize: '13px',
    color: '#B87420',
    fontWeight: 600,
  },
  rname: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#EDE8DF',
  },
  rcode: {
    fontSize: '10px',
    color: '#3A3028',
    fontFamily: 'JetBrains Mono, monospace',
  },
  membersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  avatarStack: {
    display: 'flex',
    alignItems: 'center',
  },
  onlineCount: {
    fontSize: '11px',
    color: '#4A4038',
    marginLeft: '6px',
  },
  messages: {
    flex: 1,
    padding: '14px 18px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    gap: 0,
  },
  inputWrap: {
    padding: '10px 18px 14px',
    flexShrink: 0,
  },
  inputInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#211D17',
    border: '1px solid #2C2720',
    borderRadius: '7px',
    padding: '8px 10px 8px 13px',
  },
  fakePlaceholder: {
    flex: 1,
    fontSize: '12.5px',
    color: '#3A3028',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  sendBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '5px',
    background: '#B87420',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={S.page}>

      {/* Navbar */}
      <nav style={S.nav}>
        <span style={S.logo}>ChatSpace</span>
        <div style={S.navLinks}>
          <button onClick={() => navigate('/login')} style={S.navLogin}>Login</button>
          <button onClick={() => navigate('/register')} style={S.navCta}>Get started</button>
        </div>
      </nav>

      {/* Body */}
      <div style={S.body}>

        {/* Left */}
        <div style={S.left}>
          <div>
            <p style={S.eyebrow}>Real-time messaging</p>
            <h1 style={S.headline}>
              Built for<br />
              <strong style={{ fontWeight: 600, fontStyle: 'normal' }}>developers</strong><br />
              who just want<br />
              to <strong style={{ fontWeight: 600, fontStyle: 'normal' }}>ship.</strong>
            </h1>
            <p style={S.subline}>
              Create a room, share a code, start talking. No friction — real-time chat backed by Socket.io and Redis.
            </p>

            <div style={S.actions}>
              <button onClick={() => navigate('/register')} style={S.btn}>
                <div style={S.btnLeft}>
                  <span style={S.btnText}>Create a room</span>
                  <span style={S.btnSub}>new · get a shareable code</span>
                </div>
                <span style={S.btnArrow}>→</span>
              </button>
              <button onClick={() => navigate('/login')} style={S.btn}>
                <div style={S.btnLeft}>
                  <span style={S.btnText}>Join with a code</span>
                  <span style={S.btnSub}>e.g. GH7K2M91</span>
                </div>
                <span style={S.btnArrow}>→</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={S.stats}>
            {[
              { num: '<5ms', label: 'avg latency' },
              { num: 'Redis', label: 'presence' },
              { num: '∞', label: 'rooms' },
            ].map((s) => (
              <div key={s.label} style={S.stat}>
                <div style={S.statNum}>{s.num}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Chat Preview */}
        <div style={S.right}>

          {/* Room Header */}
          <div style={S.roomHeader}>
            <div style={S.roomInfo}>
              <div style={S.roomNameRow}>
                <span style={S.rhash}>#</span>
                <span style={S.rname}>backend</span>
              </div>
              <span style={S.rcode}>GH7K2M91 · share to invite</span>
            </div>
            <div style={S.membersRow}>
              <div style={S.avatarStack}>
                {[
                  { bg: '#5E4A8C', color: '#EDE8DF', letter: 'A' },
                  { bg: '#3A5E8C', color: '#EDE8DF', letter: 'B' },
                  { bg: '#B87420', color: '#17140F', letter: 'P' },
                ].map((av, i) => (
                  <div key={av.letter} style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: av.bg, border: '1.5px solid #17140F',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '8px', fontWeight: 600, color: av.color,
                    marginLeft: i === 0 ? 0 : '-5px',
                  }}>
                    {av.letter}
                  </div>
                ))}
              </div>
              <span style={S.onlineCount}>3 online</span>
            </div>
          </div>

          {/* Messages */}
          <div style={S.messages}>
            <Msg av={{ bg: '#5E4A8C', color: '#EDE8DF', letter: 'A' }} name="alice" time="11:14">
              deployment just failed on Railway — <Code>ECONNREFUSED</Code> on Redis again
            </Msg>
            <Msg av={{ bg: '#3A5E8C', color: '#EDE8DF', letter: 'B' }} name="bob" time="11:15">
              check your <Code>REDIS_URL</Code> env var — probably has quotes around it
            </Msg>
            <Cont>happened to me last week, Railway strips them weirdly</Cont>
            <Msg av={{ bg: '#B87420', color: '#17140F', letter: 'P' }} name="praful" time="11:16" isMe>
              also set <Code>maxRetriesPerRequest: null</Code> — fixes silent reconnect failures
            </Msg>
            <Msg av={{ bg: '#5E4A8C', color: '#EDE8DF', letter: 'A' }} name="alice" time="11:17">
              oh it was the quotes lol. pushing fix now 🙏
            </Msg>

            {/* Typing */}
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
          <div style={S.inputWrap}>
            <div style={S.inputInner}>
              <span style={S.fakePlaceholder}>Message #backend</span>
              <div style={S.sendBtn}>
                <span style={{ color: '#17140F', fontSize: '13px' }}>↑</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Msg({ av, name, time, isMe, children }) {
  return (
    <div style={{ display: 'flex', gap: '9px', marginBottom: '10px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: av.bg, color: av.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: 600, flexShrink: 0, marginTop: '1px',
      }}>
        {av.letter}
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
    <code style={{
      background: '#211D17', border: '1px solid #2C2720',
      borderRadius: '3px', padding: '1px 5px',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px', color: '#B87420',
    }}>
      {children}
    </code>
  )
}