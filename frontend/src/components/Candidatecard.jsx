import { motion } from 'framer-motion'

export default function CandidateCard({ entry, index, onSelect }) {
  const c = entry.candidate
  const matchedSkills = entry.match.matched_required_skills || []
  const missingSkills = (entry.match.missing_required_skills || []).slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
      style={{
        background: '#fff', border: '1px solid #e8e8e8',
        borderRadius: '16px', padding: '28px',
        cursor: 'pointer', position: 'relative',
        overflow: 'hidden', transition: 'border-color 0.2s',
      }}
      onClick={() => onSelect(entry)}
    >
      {/* Top bar on hover */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: '#0a0a0a', transformOrigin: 'left',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: '#0a0a0a', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700,
        }}>
          {entry.rank}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: 'Match', value: entry.match.match_score },
            { label: 'Interest', value: entry.interest.interest_score },
          ].map(s => (
            <div key={s.label} style={{
              background: '#f5f5f5', borderRadius: '8px',
              padding: '8px 14px', textAlign: 'center', minWidth: '64px',
            }}>
              <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                {s.value.toFixed(0)}
              </div>
              <div style={{
                fontSize: '10px', color: '#a0a0a0',
                fontWeight: 500, textTransform: 'uppercase',
                letterSpacing: '0.5px', marginTop: '1px',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.4px' }}>
        {c.name}
      </div>
      <div style={{ fontSize: '14px', color: '#555', marginTop: '2px' }}>
        {c.current_title || c.seniority_label}
      </div>

      <div style={{ display: 'flex', gap: '20px', margin: '14px 0' }}>
        <span style={{ fontSize: '13px', color: '#555' }}>⏱ {c.years_experience} yrs exp</span>
        <span style={{ fontSize: '13px', color: '#555' }}>🎓 {c.education_label}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
        {matchedSkills.slice(0, 4).map(s => (
          <span key={s} style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
            fontWeight: 500, background: '#0a0a0a', color: '#fff',
          }}>{s}</span>
        ))}
        {missingSkills.map(s => (
          <span key={s} style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
            fontWeight: 500, background: '#fff', color: '#a0a0a0',
            border: '1px solid #e8e8e8', textDecoration: 'line-through',
          }}>{s}</span>
        ))}
      </div>

      <button
        style={{
          marginTop: '20px', width: '100%',
          background: '#fff', color: '#0a0a0a',
          border: '1.5px solid #e8e8e8', padding: '11px',
          borderRadius: '8px', fontSize: '13px', fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.target.style.background = '#0a0a0a'; e.target.style.color = '#fff' }}
        onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.color = '#0a0a0a' }}
      >
        View Full Profile
      </button>
    </motion.div>
  )
}