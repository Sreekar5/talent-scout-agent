import { useState } from 'react'
import { motion } from 'framer-motion'

export default function JobDescriptionForm({ onSubmit }) {
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!jdText.trim()) return setError('Please enter a job description first.')
    setError('')
    setLoading(true)
    try {
      await onSubmit(jdText)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ background: '#f5f5f5', padding: '100px 48px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="section-eyebrow">02 — Match Candidates</p>
          <h2 className="section-title" style={{ marginBottom: '8px' }}>
            Let's find your ideal candidate
          </h2>
          <p style={{ color: '#555', fontSize: '16px', marginBottom: '40px' }}>
            Start by pasting your job description below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e8e8e8',
            overflow: 'hidden',
            boxShadow: '0 2px 40px rgba(0,0,0,0.06)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 32px',
            borderBottom: '1px solid #e8e8e8',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: '#0a0a0a', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 600,
            }}>1</div>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Job Description</span>
          </div>

          <div style={{ padding: '32px' }}>
            <div style={{
              fontSize: '13px', fontWeight: 600,
              marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              📋 Enter Job Description
            </div>

            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder={`Paste or type the job description here...\n\nExample: We're looking for a Senior ML Engineer with 4+ years of experience in Python, TensorFlow, and model deployment...`}
              style={{
                width: '100%',
                minHeight: '220px',
                padding: '16px',
                fontSize: '14px',
                lineHeight: 1.7,
                border: '1.5px solid #e8e8e8',
                borderRadius: '10px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#0a0a0a'}
              onBlur={e => e.target.style.borderColor = '#e8e8e8'}
            />

            {error && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>
                {error}
              </p>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading || !jdText.trim()}
              >
                {loading ? 'Parsing...' : 'Parse Job Description →'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}