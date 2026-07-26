import { motion, AnimatePresence } from 'framer-motion'

export default function CandidateModal({ entry, onClose }) {
  if (!entry) return null
  const c = entry.candidate
  const conversation = entry.interest.conversation || []

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 200, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px', backdropFilter: 'blur(4px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: '20px',
            maxWidth: '680px', width: '100%',
            maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '28px 32px',
            borderBottom: '1px solid #e8e8e8',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            position: 'sticky', top: 0, background: '#fff', zIndex: 1,
          }}>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                {c.name}
              </h3>
              <p style={{ fontSize: '14px', color: '#555', marginTop: '4px' }}>
                {c.current_title || c.seniority_label}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none',
                fontSize: '22px', cursor: 'pointer',
                color: '#a0a0a0', lineHeight: 1, padding: '4px',
              }}
            >✕</button>
          </div>

          <div style={{ padding: '28px 32px' }}>
            {/* Scores */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              {[
                { label: 'Match Score', value: entry.match.match_score },
                { label: 'Interest Score', value: entry.interest.interest_score },
                { label: 'Combined', value: entry.combined_score },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, background: '#f5f5f5',
                  borderRadius: '12px', padding: '20px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-1px' }}>
                    {s.value.toFixed(1)}
                  </div>
                  <div style={{
                    fontSize: '12px', color: '#a0a0a0',
                    fontWeight: 500, textTransform: 'uppercase',
                    letterSpacing: '1px', marginTop: '4px',
                  }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Match Breakdown */}
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{
                fontSize: '13px', fontWeight: 600, color: '#a0a0a0',
                textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px',
              }}>Match Breakdown</h4>
              <div style={{
                background: '#f5f5f5', borderRadius: '10px',
                padding: '16px', fontSize: '13px',
                lineHeight: 1.8, color: '#222', whiteSpace: 'pre-line',
              }}>
                {entry.match.reasoning}
              </div>
            </div>

            {/* Conversation */}
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{
                fontSize: '13px', fontWeight: 600, color: '#a0a0a0',
                textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px',
              }}>Outreach Conversation</h4>
              {conversation.map((turn, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '11px', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '1px',
                    color: '#a0a0a0', marginBottom: '4px',
                  }}>
                    {turn.role === 'agent' ? '🤖 Recruiter' : '👤 Candidate'}
                  </div>
                  <div style={{
                    padding: '12px 16px', borderRadius: '12px',
                    fontSize: '14px', lineHeight: 1.6,
                    maxWidth: '90%',
                    background: turn.role === 'agent' ? '#0a0a0a' : '#f5f5f5',
                    color: turn.role === 'agent' ? '#fff' : '#0a0a0a',
                    marginLeft: turn.role === 'candidate' ? 'auto' : '0',
                    borderBottomLeftRadius: turn.role === 'agent' ? '4px' : '12px',
                    borderBottomRightRadius: turn.role === 'candidate' ? '4px' : '12px',
                  }}>
                    {turn.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Interest Analysis */}
            <div>
              <h4 style={{
                fontSize: '13px', fontWeight: 600, color: '#a0a0a0',
                textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px',
              }}>Interest Analysis</h4>
              <div style={{
                background: '#f5f5f5', borderRadius: '10px',
                padding: '16px', fontSize: '13px',
                lineHeight: 1.8, color: '#222', whiteSpace: 'pre-line',
              }}>
                {entry.interest.reasoning}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}