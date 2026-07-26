import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  {
    num: '01',
    title: 'Enter Job Description',
    desc: 'Paste or type the job requirements. Our AI understands context, skills, and nuance.',
  },
  {
    num: '02',
    title: 'Upload Resumes',
    desc: 'Drag and drop multiple resumes in PDF format. We handle the rest.',
  },
  {
    num: '03',
    title: 'AI Analysis',
    desc: 'BERT semantic matching scores every candidate on skills, experience and qualifications in real time.',
  },
  {
    num: '04',
    title: 'Get Ranked Results',
    desc: 'Receive candidates ranked by match score with detailed breakdowns and insights.',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id="how-it-works"
      ref={ref}
      style={{
        padding: '100px 48px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <motion.p
        className="section-eyebrow"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        01 — How it works
      </motion.p>

      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ maxWidth: '560px', marginBottom: '60px' }}
      >
        Four steps to find your perfect hire
      </motion.h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        border: '1px solid #e8e8e8',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 * i }}
            style={{
              padding: '36px 28px',
              borderRight: i < steps.length - 1 ? '1px solid #e8e8e8' : 'none',
              cursor: 'default',
              transition: 'background 0.2s',
            }}
            whileHover={{ background: '#f5f5f5' }}
          >
            <p style={{
              fontSize: '13px', fontWeight: 600,
              color: '#a0a0a0', marginBottom: '20px',
            }}>
              {step.num}
            </p>
            <h3 style={{
              fontSize: '16px', fontWeight: 600,
              marginBottom: '10px', letterSpacing: '-0.3px',
            }}>
              {step.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}