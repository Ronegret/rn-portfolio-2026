import React, { useState, useEffect } from 'react';
import { T } from '../data/translations';

export default function About({ lang }) {
  const t = T[lang] || T.es;
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 920);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 920);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="sec" id="sobre-mi">
      <div className="wrap">
        <span className="sec-n" aria-hidden="true">01</span>
        <p className="eyebrow rv">{t.about_ey}</p>
        <h2 className="sh rv" dangerouslySetInnerHTML={{ __html: t.about_h }}></h2>
        
        <div 
          id="about-grid" 
          style={{ 
            display: 'grid', 
            gap: '2rem',
            gridTemplateColumns: isDesktop ? '1.2fr 1fr' : '1fr'
          }}
        >
          <div className="rv">
            <p 
              style={{ 
                fontSize: 'clamp(14px, .97rem, 16px)', 
                color: 'var(--t2)', 
                lineHeight: 1.85, 
                marginBottom: '1.1rem' 
              }} 
              dangerouslySetInnerHTML={{ __html: t.about_p1 }}
            />
            <p 
              style={{ 
                fontSize: 'clamp(14px, .97rem, 16px)', 
                color: 'var(--t2)', 
                lineHeight: 1.85, 
                marginBottom: '1.4rem' 
              }} 
              dangerouslySetInnerHTML={{ __html: t.about_p2 }}
            />
            <blockquote 
              style={{ 
                borderLeft: '3px solid var(--a1)', 
                paddingLeft: '1.2rem', 
                fontFamily: 'var(--fd)', 
                fontStyle: 'italic', 
                fontSize: 'clamp(1.1rem, 1.5rem, 1.5rem)', 
                color: 'var(--t1)', 
                lineHeight: 1.5, 
                transition: 'font-family .5s, border-color .4s' 
              }} 
              dangerouslySetInnerHTML={{ __html: t.about_quote }}
            />
          </div>
          
          <div id="about-cards" style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
            {/* Contact details card */}
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bord2)', borderRadius: 'var(--rs)', padding: '1.3rem', transition: 'all .35s var(--ease)' }}>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--a1)', marginBottom: '.85rem' }}>
                {t.info_head}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '.55rem 0', borderBottom: '1px solid var(--bord)', fontSize: '13px' }}>
                <span style={{ color: 'var(--t2)' }}>{t.loc_l}</span>
                <span style={{ color: 'var(--t1)', fontWeight: 600 }}>Barcelona, España</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '.55rem 0', borderBottom: '1px solid var(--bord)', fontSize: '13px' }}>
                <span style={{ color: 'var(--t2)' }}>{t.mod_l}</span>
                <span style={{ color: 'var(--t1)', fontWeight: 600 }}>{t.mod_v}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '.55rem 0', borderBottom: '1px solid var(--bord)', fontSize: '13px' }}>
                <span style={{ color: 'var(--t2)' }}>{t.avail_l}</span>
                <span style={{ color: 'var(--a2)', fontWeight: 700 }}>{t.avail_v}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '.55rem 0', fontSize: '13px' }}>
                <span style={{ color: 'var(--t2)' }}>{t.obj_l}</span>
                <span style={{ color: 'var(--t1)', fontWeight: 600 }}>{t.obj_v}</span>
              </div>
            </div>

            {/* Languages card */}
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bord2)', borderRadius: 'var(--rs)', padding: '1.3rem' }}>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--a1)', marginBottom: '.85rem' }}>
                {t.lang_head}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem 0', borderBottom: '1px solid var(--bord)', fontSize: '13px' }}>
                <span style={{ color: 'var(--t2)' }}>Español</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <div style={{ width: '65px', height: '5px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: 'var(--a1)', borderRadius: '3px' }}></div>
                  </div>
                  <span style={{ color: 'var(--t1)', fontWeight: 600, fontSize: '11px' }}>{t.native}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem 0', borderBottom: '1px solid var(--bord)', fontSize: '13px' }}>
                <span style={{ color: 'var(--t2)' }}>Inglés</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <div style={{ width: '65px', height: '5px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '72%', height: '100%', background: 'var(--a1)', borderRadius: '3px' }}></div>
                  </div>
                  <span style={{ color: 'var(--t1)', fontWeight: 600, fontSize: '11px' }}>B2</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem 0', fontSize: '13px' }}>
                <span style={{ color: 'var(--t2)' }}>Catalán</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <div style={{ width: '65px', height: '5px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '40%', height: '100%', background: 'var(--a1)', borderRadius: '3px' }}></div>
                  </div>
                  <span style={{ color: 'var(--t1)', fontWeight: 600, fontSize: '11px' }}>A2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
