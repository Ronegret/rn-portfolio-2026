import React from 'react';
import { T } from '../data/translations';
import useTilt from '../hooks/useTilt';

export function AnimatedCounter({ target, suffix = '', duration = 1350 }) {
  const [count, setCount] = React.useState(0);
  const elementRef = React.useRef(null);
  const animatedRef = React.useRef(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          let startTimestamp = null;
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.round(progress * target));
            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
        }
      });
    }, { threshold: 0.2 });

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, [target, duration]);

  return (
    <span ref={elementRef}>{count}{suffix}</span>
  );
}

const AVATARS = {
  saas: '/img/ssss.webp',
  editorial: '/img/foto_estilo4.webp',
  cyber: '/img/foto_estilo3.webp',
  diario: '/img/foto_estilo2.webp',
  hud: '/img/foto_estilo5.webp'
};

export default function Hero({ lang, theme, onOpenCv }) {
  const t = T[lang] || T.es;
  const tiltRef = useTilt();

  const triggerFlash = () => {
    document.body.classList.add('flashing');
    setTimeout(() => document.body.classList.remove('flashing'), 100);
  };

  const handleProjectsClick = (e) => {
    e.preventDefault();
    triggerFlash();
    const element = document.getElementById('proyectos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero">
      <div className="hero-inner">
        {/* LEFT: copy */}
        <div className="hero-copy">
          <div className="tag-row rv">
            <span className="tag tag-green">
              <span className="logo-dot" style={{ margin: 0, marginRight: '4px' }}></span> 
              <span>{t.avail_tag}</span>
            </span>
            <span className="tag">{t.tag_remote}</span>
            <span className="tag">{t.tag_mode}</span>
          </div>
          
          <span className="hero-eyebrow rv">PRODUCT DESIGNER UX/UI · IA APLICADA · AUTOMATIZACIÓN</span>
          
          <h1 className="hero-h rv" data-d="1" id="hero-title">
            <span dangerouslySetInnerHTML={{ __html: t.hero_h1 }}></span><br />
            <em dangerouslySetInnerHTML={{ __html: t.hero_h2 }}></em>
          </h1>
          
          <p className="hero-sub rv" data-d="2" dangerouslySetInnerHTML={{ __html: t.hero_sub }}></p>
          
          <ul className="vp-list rv" data-d="3">
            <li className="vp">
              <span className="vp-ic">◆</span>
              <span dangerouslySetInnerHTML={{ __html: t.vp1 }}></span>
            </li>
            <li className="vp">
              <span className="vp-ic">⚡</span>
              <span dangerouslySetInnerHTML={{ __html: t.vp2 }}></span>
            </li>
            <li className="vp">
              <span className="vp-ic">◈</span>
              <span dangerouslySetInnerHTML={{ __html: t.vp3 }}></span>
            </li>
          </ul>
          
          <div className="cta-row rv" data-d="4">
            <a href="#proyectos" onClick={handleProjectsClick} className="btn-p">
              {t.cta_p}
            </a>
            <a 
              href="https://wa.me/34653567610" 
              onClick={triggerFlash} 
              className="btn-s" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              💬 WhatsApp
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                triggerFlash();
                onOpenCv && onOpenCv('ai');
              }}
              className="btn-s trigger-flash"
            >
              📄 CV
            </button>
          </div>
          
          <p className="trust rv" data-d="5">
            <span>{t.trust1}</span><span className="tdot"></span>
            <span>{t.trust2}</span><span className="tdot"></span>
            <span>{t.trust3}</span>
          </p>
        </div>

        {/* RIGHT: profile card */}
        <div className="pcard-wrap">
          <div className="pcard rv-s" data-d="2" ref={tiltRef}>
            <div className="av-wrap">
              <img 
                decoding="async" 
                className="av" 
                id="av" 
                src={AVATARS[theme] || AVATARS.saas} 
                alt="Foto de perfil" 
              />
            </div>
            <p className="cname">{t.card_name}</p>
            <p className="crole">IA aplicada · Automatización · Founder</p>
            <div className="cloc">📍 Barcelona, España</div>
            <div className="cstats">
              <div className="cstat">
                <div className="cstat-n">
                  <AnimatedCounter target={17} suffix="+" />
                </div>
                <div className="cstat-l">{t.stat1}</div>
              </div>
              <div className="cstat">
                <div className="cstat-n">
                  <AnimatedCounter target={9} />
                </div>
                <div className="cstat-l">{t.stat2}</div>
              </div>
              <div className="cstat">
                <div className="cstat-n">
                  <AnimatedCounter target={40} suffix="+" />
                </div>
                <div className="cstat-l">{t.stat3}</div>
              </div>
            </div>
            <div className="cdiv"></div>
            <div className="cbadges">
              <span className="cb cb2">Make</span>
              <span className="cb cb2">n8n</span>
              <span className="cb cb2">Botpress</span>
              <span className="cb cb1">Figma</span>
              <span className="cb cb1">React</span>
              <span className="cb cb1">Tailwind</span>
              <span className="cb cbn">Claude API</span>
              <span className="cb cbn">WordPress</span>
              <span className="cb cb2">Vapi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
