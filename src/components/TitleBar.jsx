import React from 'react'

function IconSeal() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="14" rx="7" ry="6" fill="#7c6af6" opacity=".9"/>
      <ellipse cx="12" cy="13" rx="5" ry="4" fill="#5b4fd4"/>
      <circle cx="10" cy="11" r="1.5" fill="white" opacity=".8"/>
      <circle cx="14" cy="11" r="1.5" fill="white" opacity=".8"/>
      <ellipse cx="12" cy="13.5" rx="2" ry="1" fill="white" opacity=".5"/>
      <path d="M7 18 Q5 20 4 22" stroke="#7c6af6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 18 Q19 20 20 22" stroke="#7c6af6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export default function TitleBar() {
  const isElectron = !!window.seal

  return (
    <div className="titlebar">
      <div className="titlebar-logo">
        <IconSeal />
        Seal <span>for Windows</span>
      </div>
      <div className="titlebar-spacer" />
      {isElectron && (
        <div className="wc-btns titlebar-no-drag">
          <button className="wc-btn" onClick={() => window.seal.minimize()} title="Minimieren">
            <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="5.5" width="8" height="1.5" rx=".75" fill="currentColor"/></svg>
          </button>
          <button className="wc-btn" onClick={() => window.seal.maximize()} title="Maximieren">
            <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
          </button>
          <button className="wc-btn close" onClick={() => window.seal.close()} title="Schließen">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
