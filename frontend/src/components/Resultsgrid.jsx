import { useState } from 'react'
import { motion } from 'framer-motion'
import CandidateCard from './CandidateCard'

const LOADING_STEPS = [
  'Running BERT semantic matching',
  'Scoring skill overlap',
  'Simulating outreach conversations',
  'Computing interest scores',
  'Ranking shortlist',
]

export default function ResultsGrid({ jd, candidates, results, loading, onRunMatching, onRestart, onSelectCandidate }) {
  const [activeStep, setActiveStep] = useState(-1)

  async function handleRun() {
    let i = 0
    const interval = setInterval(() => {
      setActiveStep(i)
      i++
      if (i >= LOADING_STEPS.length) clearInterval(interval)
    }, 900)
    await onRunMatching()
    clearInterval(interval)
    setActiveStep(-1)
  }

  if (!results) {
    return (
      <section style={{ background: '#f5f5f5', padding: '100px 48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid #e8e8e8',
              boxShadow: '0 2px 40px rgba(0,0,0,0.06)',
              padding: '60px 32px', textAlign: 'center',
            }}
          >
            {!loading ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '10px' }}>
                  Ready to analyse
                </h3>
                <p style={{ color: '#555', fontSize: '15px', marginBottom: '32px' }}>
                  {candidates.length} resume{candidates.length !== 1 ? 's' : ''} uploaded for "{jd?.title}".
                  Click below to run BERT matching and score candidate interest.
                </p>
                <button className="btn-primary" onClick={handleRun}>
                  Analyse & Match Candidates →
                </button>
              </>
            ) : (
              <>
                <div style={{
                  width: '40px', height: '40px',
                  border: '2.5px solid #e8e8e8',
                  borderTopColor: '#0a0a0a',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 20px',
                }} />
                <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '24px' }}>
                  Analysing candidates...
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', maxWidth: '320px', margin: '0 auto' }}>
                  {LOADING_STEPS.map((step, i) => (
                    <div key={step} style={{
                      fontSize: '13px',
                      color: i < activeStep ? '#22c55e' : i === activeStep ? '#0a0a0a' : '#a0a0a0',
                      fontWeight: i === activeStep ? 500 : 400,
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      {i < activeStep ? '✓' : i === activeStep ? '⟳' : '○'} {step}
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </section>
    )
  }

  return (
    <section style={{ padding: '100px 48px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '40px' }}
      >
        <p className="section-eyebrow">03 — Results</p>
        <h2 className="section-title">Top matched candidates</h2>
        <p style={{ color: '#555', marginTop: '8px', fontSize: '15px' }}>
          Ranked by AI-powered analysis · {results.total_candidates} candidates evaluated for "{results.jd_title}"
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {results.shortlist.map((entry, i) => (
          <CandidateCard
            key={entry.candidate.id}
            entry={entry}
            index={i}
            onSelect={onSelectCandidate}
          />
        ))}
      </div>

      <div style={{ marginTop: '48px', textAlign: 'center' }}>
        <button
          onClick={onRestart}
          style={{
            background: '#fff', color: '#0a0a0a',
            border: '1.5px solid #e8e8e8', padding: '13px 32px',
            borderRadius: '8px', fontSize: '14px', fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'border-color 0.2s',
          }}
        >
          Start New Search
        </button>
      </div>
    </section>
  )
}