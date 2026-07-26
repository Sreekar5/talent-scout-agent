import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ResumeUpload({ jd, onSubmit, onBack }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragover, setDragover] = useState(false)

  function addFiles(newFiles) {
    const pdfs = [...newFiles].filter(f => f.name.endsWith('.pdf'))
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...pdfs.filter(f => !existing.has(f.name))]
    })
  }

  function removeFile(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    if (!files.length) return setError('Please upload at least one PDF resume.')
    setError('')
    setLoading(true)
    try {
      await onSubmit(files)
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
          style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid #e8e8e8',
            boxShadow: '0 2px 40px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 32px', borderBottom: '1px solid #e8e8e8',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: '#0a0a0a', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 600,
            }}>2</div>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Upload Resumes</span>
            <span style={{
              marginLeft: 'auto', fontSize: '13px', color: '#555',
              background: '#f5f5f5', padding: '4px 12px', borderRadius: '20px',
            }}>
              Role: {jd?.title}
            </span>
          </div>

          <div style={{ padding: '32px' }}>
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragover(true) }}
              onDragLeave={() => setDragover(false)}
              onDrop={e => { e.preventDefault(); setDragover(false); addFiles(e.dataTransfer.files) }}
              style={{
                border: `1.5px dashed ${dragover ? '#0a0a0a' : '#e8e8e8'}`,
                borderRadius: '10px',
                background: dragover ? '#fff' : '#f5f5f5',
                padding: '40px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={e => addFiles(e.target.files)}
                style={{
                  position: 'absolute', inset: 0,
                  opacity: 0, cursor: 'pointer',
                }}
              />
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>☁</div>
              <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>
                Drag & drop resumes here
              </div>
              <div style={{ fontSize: '13px', color: '#a0a0a0' }}>
                or click to browse · PDF only
              </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {files.map((f, i) => (
                  <motion.div
                    key={f.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', background: '#f5f5f5',
                      borderRadius: '8px', fontSize: '13px',
                    }}
                  >
                    <span>📄</span>
                    <span style={{ flex: 1, fontWeight: 500 }}>{f.name}</span>
                    <span style={{ color: '#a0a0a0', fontSize: '12px' }}>
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                    <span
                      onClick={() => removeFile(i)}
                      style={{ cursor: 'pointer', color: '#a0a0a0', fontSize: '18px', lineHeight: 1 }}
                    >×</span>
                  </motion.div>
                ))}
              </div>
            )}

            {error && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{error}</p>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={onBack}
                style={{
                  background: 'none', border: '1.5px solid #e8e8e8',
                  padding: '12px 24px', borderRadius: '8px',
                  fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ← Back
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading || !files.length}
              >
                {loading ? 'Uploading...' : `Upload ${files.length} Resume${files.length !== 1 ? 's' : ''} →`}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}