import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '140px 48px 80px',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          fontSize: '12px', fontWeight: 500,
          letterSpacing: '2px', textTransform: 'uppercase',
          color: '#a0a0a0', marginBottom: '28px',
        }}
      >
        AI-Powered Recruitment
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          fontSize: 'clamp(42px, 7vw, 88px)',
          fontWeight: 700,
          lineHeight: 1.02,
          letterSpacing: '-2.5px',
          maxWidth: '780px',
        }}
      >
        Find the perfect candidate in seconds, not hours.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          marginTop: '24px',
          fontSize: '18px',
          color: '#555',
          lineHeight: 1.6,
          maxWidth: '440px',
        }}
      >
        Drop your job description. Upload resumes.
        Let AI find your ideal match instantly.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}
      >
        <a href="#app-section" className="btn-primary">
          Start Matching <span>→</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' }}>
          <span style={{
            width: '6px', height: '6px',
            background: '#22c55e', borderRadius: '50%',
            display: 'inline-block',
            animation: 'pulse 2s infinite',
          }} />
          AI-powered · Instant matching · Zero bias
        </div>
      </motion.div>

      {/* Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={{
          marginTop: '80px',
          borderTop: '1px solid #e8e8e8',
          borderBottom: '1px solid #e8e8e8',
          overflow: 'hidden',
          padding: '14px 0',
        }}
      >
        <div style={{
          display: 'flex',
          gap: '64px',
          animation: 'ticker 20s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '64px' }}>
              {['AI-Powered Recruitment', 'Instant Matching', 'Zero Bias',
                'Precision Hiring', 'BERT Semantic Analysis', 'Interest Scoring',
                'Explainable Results'].map(item => (
                <span key={item} style={{
                  fontSize: '12px', fontWeight: 500,
                  letterSpacing: '2px', textTransform: 'uppercase',
                  color: '#a0a0a0',
                }}>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  )
}