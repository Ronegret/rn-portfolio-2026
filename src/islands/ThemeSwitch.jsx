import { THEMES } from './themes.js';
import { useTheme, setTheme } from './store.js';

// variant: 'dock' (aside#dock de escritorio) | 'mob' (.mob-themes del menu movil) | 'cards' (.thm-g de #estilos)
export default function ThemeSwitch({ variant }) {
  const cur = useTheme();
  const pick = (id) => () => setTheme(id);

  if (variant === 'cards') {
    return (
      <div className="thm-g rv">
        {THEMES.map((t) => (
          <button key={t.id} type="button" className={'tc' + (cur === t.id ? ' on' : '')} data-tc={t.id} aria-pressed={cur === t.id} onClick={pick(t.id)}>
            <div className={'tc-p ' + t.tp}>
              <div className="tp-bar" style={t.bar}></div>
              <div className="tp-bar s" style={t.bar2}></div>
              <div className="tp-acc" style={t.acc}></div>
              <div className="tp-btn" style={t.btn}></div>
              <div className="tp-on">Activo</div>
            </div>
            <div className="tc-l"><div className="tc-n">{t.name}</div><div className="tc-d">{t.desc}</div></div>
          </button>
        ))}
      </div>
    );
  }

  const dock = variant === 'dock';
  const buttons = THEMES.map((t) => (
    <button key={t.id} type="button" className={'dk' + (cur === t.id ? ' on' : '')} data-t={t.id} data-label={dock ? t.name : undefined} aria-label={'Tema ' + t.name} aria-pressed={cur === t.id} onClick={pick(t.id)}>
      <div className="dk-i" style={{ background: t.grad }}></div>
    </button>
  ));
  return dock ? <aside id="dock" aria-label="Cambiar tema visual">{buttons}</aside> : <div className="mob-themes">{buttons}</div>;
}
