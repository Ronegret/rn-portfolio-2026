import React from 'react';
import { T } from '../data/translations';
import { labFeatures, labCards } from '../data/lab';
import useTilt from '../hooks/useTilt';

function LabFeatureCard({ feat, t }) {
  const tiltRef = useTilt();

  const triggerFlash = () => {
    document.body.classList.add('flashing');
    setTimeout(() => document.body.classList.remove('flashing'), 100);
  };

  const tagText = feat.tagKey ? t[feat.tagKey] : '';
  const badgeText = feat.badgeKey ? t[feat.badgeKey] : '';
  const desc = feat.descKey ? t[feat.descKey] : '';
  const buttonText = t.lab_btn || 'Visitar →';

  return (
    <a 
      ref={tiltRef}
      href={feat.link} 
      target="_blank" 
      rel="noopener noreferrer" 
      onClick={triggerFlash}
      className={`lab-feat ${feat.isAI ? 'lab-feat-ai' : ''} trigger-flash`}
    >
      <div 
        className="lab-img" 
        style={feat.background ? { background: feat.background } : {}}
      >
        <img 
          decoding="async" 
          src={feat.image} 
          alt={feat.title} 
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = feat.title;
          }}
        />
      </div>
      <div className="lab-body">
        <span className="lab-tag" style={feat.isAI ? { color: 'var(--a2)' } : {}}>
          {tagText} 
          {badgeText && (
            <span style={{ 
              background: 'color-mix(in srgb, var(--a2) 14%, transparent)', 
              padding: '2px 8px', 
              borderRadius: '100px', 
              border: '1px solid color-mix(in srgb, var(--a2) 28%, transparent)', 
              fontSize: '9px',
              marginLeft: '6px'
            }}>
              {badgeText}
            </span>
          )}
        </span>
        <h3 className="lab-h">{feat.title}</h3>
        <p className="lab-d">{desc}</p>
        <div className="lab-pills">
          {feat.pills.map((pill, idx) => (
            <span key={idx}>{pill}</span>
          ))}
        </div>
        <span className="lab-link">{buttonText}</span>
      </div>
    </a>
  );
}

function LabCard({ card, t }) {
  const tiltRef = useTilt();

  const triggerFlash = () => {
    document.body.classList.add('flashing');
    setTimeout(() => document.body.classList.remove('flashing'), 100);
  };

  const desc = card.descKey ? t[card.descKey] : '';
  const buttonText = t.lab_btn || 'Ver →';

  return (
    <a 
      ref={tiltRef}
      href={card.link} 
      target="_blank" 
      rel="noopener noreferrer" 
      onClick={triggerFlash}
      className="lab-card trigger-flash"
    >
      <div className="lab-card-img">
        <img decoding="async" src={card.image} alt={card.title} />
      </div>
      <div className="lab-card-body">
        <span className="lab-tag">
          {card.tag}
          {card.isNew && (
            <span className="lab-new-badge" style={{ marginLeft: '6px' }}>Nuevo</span>
          )}
        </span>
        <h4 className="lab-card-h">{card.title}</h4>
        <p className="lab-card-d">{desc}</p>
        <span className="lab-link">{buttonText}</span>
      </div>
    </a>
  );
}

export default function Lab({ lang }) {
  const t = T[lang] || T.es;

  return (
    <section className="sec" id="laboratorio">
      <div className="wrap">
        <span className="sec-n" aria-hidden="true">04</span>
        <p className="eyebrow rv">{t.lab_ey}</p>
        <h2 className="sh rv" dangerouslySetInnerHTML={{ __html: t.lab_h }}></h2>
        <p className="sb rv" dangerouslySetInnerHTML={{ __html: t.lab_sub }}></p>
        
        <div className="lab-grid rv">
          {/* Featured Lab Ecosystems */}
          {labFeatures.map((feat) => (
            <LabFeatureCard 
              key={feat.id} 
              feat={feat} 
              t={t} 
            />
          ))}

          {/* Grid of 8 sites */}
          <div className="lab-sub-grid">
            {labCards.map((card) => (
              <LabCard 
                key={card.id} 
                card={card} 
                t={t} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
