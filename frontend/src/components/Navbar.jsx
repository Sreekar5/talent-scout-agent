import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 48px',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e8e8e8',
      boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
      transition: 'box-shadow 0.2s ease',
    }}>
      <div style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.3px' }}>
        TalentScout
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <a href="#how-it-works" style={{
          fontSize: '14px', color: '#555', textDecoration: 'none',
          transition: 'color 0.2s'
        }}>
          How it works
        </a>
        <a href="#app-section" style={{
          fontSize: '14px', color: '#555', textDecoration: 'none',
        }}>
          Match
        </a>
        <a href="#app-section" style={{
          background: '#0a0a0a', color: '#fff',
          padding: '10px 20px', borderRadius: '6px',
          fontSize: '14px', fontWeight: 500,
          textDecoration: 'none',
          transition: 'all 0.2s',
        }}>
          Get Started
        </a>
      </div>
    </nav>
  )
}