import React from 'react';
import { T } from '../data/translations';

export default function Footer({ lang, setLang }) {
  const t = T[lang] || T.es;

  return (
    <footer>
      <div className="foot">
        <div>
          <p>© 2026 · <a href="https://linkedin.com/in/rodrigonegretearos" target="_blank" rel="noopener noreferrer">LinkedIn</a> · Portfolio</p>
          <p 
            style={{ marginTop: '.25rem', fontSize: '11.5px', opacity: 0.55 }}
            dangerouslySetInnerHTML={{ __html: t.foot_made }}
          />
        </div>
        <div style={{ display: 'flex', gap: '.4rem' }}>
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
      </div>
    </footer>
  );
}
