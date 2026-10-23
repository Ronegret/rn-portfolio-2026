import { useEffect, useRef, useState } from 'react';
import { useLang } from './store.js';

const OPTS = [['es', 'ES', 'Español'], ['ca', 'CA', 'Català'], ['en', 'EN', 'English']];
const svg = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

// Solo la UI del desplegable. El cambio de idioma (data-i, cortina) sigue en main.js: el clic en
// cualquier [data-lang] lo gestiona la delegacion global; la isla deriva el estado de html[lang].
export default function LangSwitch() {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);

  useEffect(() => {
    if (!open) return;
    const away = (e) => { if (!root.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') { setOpen(false); trigger.current.focus(); } };
    document.addEventListener('click', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('click', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div className={'lang-switch' + (open ? ' open' : '')} id="lang-switch" ref={root}>
      <button type="button" className="lang-trigger" id="lang-trigger" ref={trigger} aria-haspopup="listbox" aria-expanded={open} aria-label="Cambiar idioma" onClick={() => setOpen((o) => !o)}>
        <svg className="lang-globe" width="14" height="14" viewBox="0 0 24 24" {...svg}>
          <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="lang-code" id="lang-code">{lang.toUpperCase()}</span>
        <svg className="lang-chev" width="10" height="10" viewBox="0 0 12 12" {...svg}><path d="M2 4l4 4 4-4" /></svg>
      </button>
      <div className="lang-panel" id="lang-panel" role="listbox" aria-label="Idiomas disponibles">
        <p className="lang-panel-h">Idioma <span className="lang-dot"></span></p>
        {OPTS.map(([l, code, name]) => (
          <button key={l} type="button" className={'lang-opt' + (lang === l ? ' on' : '')} data-lang={l} role="option" aria-selected={lang === l} onClick={() => setOpen(false)}>
            <span className="lang-opt-code">{code}</span>
            <span className="lang-opt-name">{name}</span>
            <span className="lang-opt-check"></span>
          </button>
        ))}
      </div>
    </div>
  );
}
