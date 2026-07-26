import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import JobDescriptionForm from './components/JobDescriptionForm'
import ResumeUpload from './components/ResumeUpload'
import ResultsGrid from './components/ResultsGrid'
import CandidateModal from './components/CandidateModal'

const API = 'http://127.0.0.1:8000'

export default function App() {
  const [step, setStep] = useState(1)       // 1=JD, 2=Resumes, 3=Results
  const [jd, setJd] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  async function handleParseJD(jdText) {
    const form = new FormData()
    form.append('jd_text', jdText)
    const res = await fetch(`${API}/api/parse-jd`, { method: 'POST', body: form })
    const data = await res.json()
    if (!data.success) throw new Error(data.detail || 'Failed to parse JD')
    setJd(data.jd)
    setStep(2)
  }

  async function handleUploadResumes(files) {
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    const res = await fetch(`${API}/api/upload-resumes`, { method: 'POST', body: form })
    const data = await res.json()
    if (!data.success) throw new Error(data.detail || 'Failed to upload resumes')
    setCandidates(data.candidates)
    setStep(3)
  }

  async function handleRunMatching() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/run-matching`, { method: 'POST' })
      const data = await res.json()
      if (!data.success) throw new Error(data.detail || 'Matching failed')
      setResults(data)
    } finally {
      setLoading(false)
    }
  }

  function handleRestart() {
    setStep(1)
    setJd(null)
    setCandidates([])
    setResults(null)
    setSelectedCandidate(null)
    document.getElementById('app-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />

      <div id="app-section">
        {step === 1 && (
          <JobDescriptionForm onSubmit={handleParseJD} />
        )}
        {step === 2 && (
          <ResumeUpload
            jd={jd}
            onSubmit={handleUploadResumes}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && !results && (
          <ResultsGrid
            jd={jd}
            candidates={candidates}
            results={null}
            loading={loading}
            onRunMatching={handleRunMatching}
            onRestart={handleRestart}
            onSelectCandidate={setSelectedCandidate}
          />
        )}
        {step === 3 && results && (
          <ResultsGrid
            jd={jd}
            candidates={candidates}
            results={results}
            loading={loading}
            onRunMatching={handleRunMatching}
            onRestart={handleRestart}
            onSelectCandidate={setSelectedCandidate}
          />
        )}
      </div>

      {selectedCandidate && (
        <CandidateModal
          entry={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </>
  )
}