import React from 'react';
import { T } from '../data/translations';

export default function Estilos({ lang, theme, setTheme }) {
  const t = T[lang] || T.es;

  const styleShowcases = [
    {
      id: 'saas',
      title: 'Dual Core AI',
      desc: 'Inter · Teal & Red',
      className: 'tp-saas',
      accentStyle1: { background: '#00d4d4', opacity: 0.7 },
      accentStyle2: { background: '#ff3333', opacity: 0.7 },
      colorStyle: { background: '#00d4d4' },
      btnStyle: { background: '#000', border: '1px solid #00d4d4', opacity: 0.8 }
    },
    {
      id: 'editorial',
      title: 'El Diario Digital',
      desc: 'Lora · Sepia y Tinta',
      className: 'tp-edit',
      accentStyle1: { background: 'rgba(26,26,26,.8)' },
      accentStyle2: { background: '#8b0000', opacity: 0.8 },
      colorStyle: { background: '#8b0000' },
      btnStyle: { background: '#1a1a1a' }
    },
    {
      id: 'cyber',
      title: 'Abstract Cyber',
      desc: 'Outfit · Neón y Plasma',
      className: 'tp-cyber',
      accentStyle1: { background: '#00f0ff', opacity: 0.6 },
      accentStyle2: { background: '#b026ff', opacity: 0.6 },
      colorStyle: { background: '#00f0ff' },
      btnStyle: { background: '#00f0ff', opacity: 0.7 }
    },
    {
      id: 'diario',
      title: 'Minimal Journal',
      desc: 'Inter · Blanco y Azul',
      className: 'tp-diar',
      accentStyle1: { background: 'rgba(0,0,0,.15)' },
      accentStyle2: { background: '#0052cc', opacity: 0.6 },
      colorStyle: { background: '#0052cc' },
      btnStyle: { background: '#111111' }
    },
    {
      id: 'hud',
      title: 'Fine Art',
      desc: 'Playfair · Negro mate dorado',
      className: 'tp-hud',
      accentStyle1: { background: 'rgba(255,255,255,.12)' },
      accentStyle2: { background: '#d4b87a', opacity: 0.55 },
      colorStyle: { background: '#d4b87a' },
      btnStyle: { background: '#d4b87a', opacity: 0.75 }
    }
  ];

  return (
    <section className="sec" id="estilos">
      <div className="wrap">
        <p className="eyebrow rv">{t.style_ey}</p>
        <h2 className="sh rv" dangerouslySetInnerHTML={{ __html: t.style_h }}></h2>
        <p className="sb rv" dangerouslySetInnerHTML={{ __html: t.style_sub }}></p>
        
        <div className="thm-g rv">
          {styleShowcases.map((showcase) => (
            <button 
              key={showcase.id}
              className={`tc ${theme === showcase.id ? 'on' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setTheme(showcase.id);
              }}
            >
              <div className={`tc-p ${showcase.className}`}>
                <div className="tp-bar" style={showcase.accentStyle1}></div>
                <div className="tp-bar s" style={showcase.accentStyle2}></div>
                <div className="tp-acc" style={showcase.colorStyle}></div>
                <div className="tp-btn" style={showcase.btnStyle}></div>
                <div className="tp-on">Activo</div>
              </div>
              <div className="tc-l">
                <div className="tc-n">{showcase.title}</div>
                <div className="tc-d">{showcase.desc}</div>
              </div>
            </button>
          ))}
        </div>
        
        <p 
          className="style-note rv" 
          dangerouslySetInnerHTML={{ __html: t.style_note }}
        />
      </div>
    </section>
  );
}
