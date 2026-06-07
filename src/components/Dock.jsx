import React from 'react';

export default function Dock({ theme, setTheme }) {
  const themes = [
    { id: 'saas', label: 'Dual Core AI', bg: 'linear-gradient(135deg, #00d4d4, #ff3333)' },
    { id: 'editorial', label: 'El Diario Digital', bg: 'linear-gradient(135deg, #f4f1ea, #8b0000)' },
    { id: 'cyber', label: 'Abstract Cyber', bg: 'linear-gradient(135deg, #b026ff, #00f0ff)' },
    { id: 'diario', label: 'Minimal Journal', bg: 'linear-gradient(135deg, #fafafa, #0052cc)' },
    { id: 'hud', label: 'Fine Art', bg: 'linear-gradient(135deg, #d4b87a, #101010)' }
  ];

  return (
    <aside id="dock" aria-label="Cambiar tema visual">
      {themes.map((thm) => (
        <button 
          key={thm.id}
          className={`dk ${theme === thm.id ? 'on' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setTheme(thm.id);
          }}
          data-label={thm.label}
        >
          <div className="dk-i" style={{ background: thm.bg }}></div>
        </button>
      ))}
    </aside>
  );
}
