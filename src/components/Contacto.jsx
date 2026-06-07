import React, { useState } from 'react';
import { T } from '../data/translations';

export default function Contacto({ lang, onOpenCv }) {
  const t = T[lang] || T.es;
  const [coords, setCoords] = useState({ mx: '50%', my: '50%' });

  const triggerFlash = () => {
    document.body.classList.add('flashing');
    setTimeout(() => document.body.classList.remove('flashing'), 100);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + '%';
    const my = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + '%';
    setCoords({ mx, my });
  };

  return (
    <section className="sec" id="contacto">
      <div className="wrap">
        <div 
          className="contact-box"
          onMouseMove={handleMouseMove}
          style={{
            '--mx': coords.mx,
            '--my': coords.my
          }}
        >
          <div className="c-aurora"></div>
          <div className="c-inner">
            <p className="eyebrow" style={{ justifyContent: 'center' }}>
              {t.contact_ey}
            </p>
            <h2 className="c-h" dangerouslySetInnerHTML={{ __html: t.contact_h }}></h2>
            <p className="c-s">{t.contact_sub}</p>
            
            <div className="c-links">
              <a 
                href="mailto:rodrigo.negrete.aros@gmail.com" 
                onClick={triggerFlash}
                className="btn-p trigger-flash"
              >
                {t.cta_email}
              </a>
              <a 
                href="https://wa.me/34653567610" 
                onClick={triggerFlash}
                className="btn-s trigger-flash" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                💬 WhatsApp
              </a>
              <a 
                href="https://linkedin.com/in/rodrigonegretearos" 
                onClick={triggerFlash}
                className="btn-s trigger-flash" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                🔗 LinkedIn
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  triggerFlash();
                  onOpenCv && onOpenCv('ux');
                }}
                className="btn-s trigger-flash"
              >
                📄 CV
              </button>
            </div>

            <div className="c-cards">
              <div className="cc">
                <div className="cc-ic">✉</div>
                <div className="cc-l">Email</div>
                <a href="mailto:rodrigo.negrete.aros@gmail.com" className="cc-v">
                  rodrigo.negrete.aros@gmail.com
                </a>
              </div>
              <div className="cc">
                <div className="cc-ic">📱</div>
                <div className="cc-l">{t.phone_l}</div>
                <a href="tel:+34653567610" className="cc-v">
                  +34 653 567 610
                </a>
              </div>
              <div className="cc">
                <div className="cc-ic">📍</div>
                <div className="cc-l">{t.loc_l}</div>
                <div className="cc-v">Barcelona, España</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
