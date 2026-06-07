import React, { useEffect } from 'react';
import { T } from '../data/translations';

export default function MobileMenu({ lang, setLang, theme, setTheme, isOpen, onClose }) {
  const t = T[lang] || T.es;

  // Add scroll lock on body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const triggerFlash = () => {
    document.body.classList.add('flashing');
    setTimeout(() => document.body.classList.remove('flashing'), 100);
  };

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    triggerFlash();
    onClose();
    
    // Slight delay to allow menu closing transition before scrolling
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  const themes = [
    { id: 'saas', label: 'Dual Core AI', bg: 'linear-gradient(135deg, #00d4d4, #ff3333)' },
    { id: 'editorial', label: 'El Diario Digital', bg: 'linear-gradient(135deg, #f4f1ea, #8b0000)' },
    { id: 'cyber', label: 'Abstract Cyber', bg: 'linear-gradient(135deg, #b026ff, #00f0ff)' },
    { id: 'diario', label: 'Minimal Journal', bg: 'linear-gradient(135deg, #fafafa, #0052cc)' },
    { id: 'hud', label: 'Fine Art', bg: 'linear-gradient(135deg, #d4b87a, #101010)' }
  ];

  return (
    <div id="mob" className={isOpen ? 'open' : ''} role="dialog" aria-modal="true">
      <button id="mob-x" onClick={onClose} aria-label="Cerrar">✕</button>
      
      <a href="#sobre-mi" onClick={(e) => handleLinkClick(e, 'sobre-mi')}>{t.nav_about}</a>
      <a href="#stack" onClick={(e) => handleLinkClick(e, 'stack')}>{t.nav_stack}</a>
      <a href="#proyectos" onClick={(e) => handleLinkClick(e, 'proyectos')}>{t.nav_projects}</a>
      <a href="#laboratorio" onClick={(e) => handleLinkClick(e, 'laboratorio')}>{t.nav_lab}</a>
      <a href="#trayectoria" onClick={(e) => handleLinkClick(e, 'trayectoria')}>{t.nav_career}</a>
      <a href="#contacto" onClick={(e) => handleLinkClick(e, 'contacto')}>{t.nav_contact}</a>
      
      <div className="mob-lang">
        <button 
          className={`nlb ${lang === 'es' ? 'on' : ''}`} 
          onClick={() => setLang('es')}
        >
          ES
        </button>
        <button 
          className={`nlb ${lang === 'ca' ? 'on' : ''}`} 
          onClick={() => setLang('ca')}
        >
          CA
        </button>
        <button 
          className={`nlb ${lang === 'en' ? 'on' : ''}`} 
          onClick={() => setLang('en')}
        >
          EN
        </button>
      </div>

      <div className="mob-themes">
        {themes.map((thm) => (
          <button 
            key={thm.id}
            className={`dk ${theme === thm.id ? 'on' : ''}`}
            onClick={() => {
              setTheme(thm.id);
              onClose();
            }}
            data-label={thm.label}
          >
            <div className="dk-i" style={{ background: thm.bg }}></div>
          </button>
        ))}
      </div>
    </div>
  );
}
