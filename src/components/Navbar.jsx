import React from 'react';
import { T } from '../data/translations';

export default function Navbar({ lang, setLang, activeSection, onMenuToggle, isMenuOpen }) {
  const t = T[lang] || T.es;

  const triggerFlash = () => {
    document.body.classList.add('flashing');
    setTimeout(() => document.body.classList.remove('flashing'), 100);
  };

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    triggerFlash();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    triggerFlash();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav id="nav">
      <a href="#hero" onClick={handleLogoClick} className="nav-logo">
        Rodrigo Negrete
        <span className="rec-badge"><span className="logo-dot"></span></span>
      </a>
      
      <ul className="nav-links">
        <li>
          <a 
            href="#sobre-mi" 
            onClick={(e) => handleLinkClick(e, 'sobre-mi')}
            className={activeSection === 'sobre-mi' ? 'act' : ''}
          >
            {t.nav_about}
          </a>
        </li>
        <li>
          <a 
            href="#stack" 
            onClick={(e) => handleLinkClick(e, 'stack')}
            className={activeSection === 'stack' ? 'act' : ''}
          >
            {t.nav_stack}
          </a>
        </li>
        <li>
          <a 
            href="#proyectos" 
            onClick={(e) => handleLinkClick(e, 'proyectos')}
            className={activeSection === 'proyectos' ? 'act' : ''}
          >
            {t.nav_projects}
          </a>
        </li>
        <li>
          <a 
            href="#laboratorio" 
            onClick={(e) => handleLinkClick(e, 'laboratorio')}
            className={activeSection === 'laboratorio' ? 'act' : ''}
          >
            {t.nav_lab}
          </a>
        </li>
        <li>
          <a 
            href="#trayectoria" 
            onClick={(e) => handleLinkClick(e, 'trayectoria')}
            className={activeSection === 'trayectoria' ? 'act' : ''}
          >
            {t.nav_career}
          </a>
        </li>
        <li>
          <a 
            href="#contacto" 
            onClick={(e) => handleLinkClick(e, 'contacto')}
            className={activeSection === 'contacto' ? 'act' : ''}
          >
            {t.nav_contact}
          </a>
        </li>
      </ul>

      <div className="nav-r">
        <div className="nav-lang">
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
        
        <a 
          href="mailto:rodrigo.negrete.aros@gmail.com" 
          onClick={triggerFlash}
          className="nav-cta"
        >
          {t.nav_cta}
        </a>
      </div>

      <button 
        id="ham" 
        onClick={onMenuToggle}
        className={isMenuOpen ? 'open' : ''}
        aria-label="Abrir menú" 
        aria-expanded={isMenuOpen ? 'true' : 'false'}
      >
        <span className="hl"></span>
        <span className="hl"></span>
        <span className="hl"></span>
      </button>
    </nav>
  );
}
