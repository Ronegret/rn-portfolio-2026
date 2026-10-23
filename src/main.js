import { T } from './content.js';
import './mobile-ux.js';
import './mobile-menu.js';
import './motion.js';
import './effects.js';
import './scroll-fx.js';

let LANG = 'es';

/* ═══════════════════════════════════════
   PRELOADER — entrada tipo rodd.es (una vez por sesión)
═══════════════════════════════════════ */
(()=>{
  const pl = document.getElementById('preloader');
  if(!pl) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Query ?intro=0 fuerza saltar (solo para debug); si no, SIEMPRE se muestra
  const params = new URLSearchParams(location.search);
  if(params.get('intro') === '0'){
    pl.remove();
    document.documentElement.classList.remove('pl-locked');
    return;
  }
  // Limpiar keys antiguas que ya no usamos
  try { localStorage.removeItem('pl_seen_at'); localStorage.removeItem('pl_seen_v2'); localStorage.removeItem('pl_seen_v3'); sessionStorage.removeItem('pl_seen'); } catch(e){}

  document.documentElement.classList.add('pl-locked');
  document.body.classList.add('pl-locked');

  // Counter 00 -> 99 durante la linea de progreso (1.6s)
  const counter = document.getElementById('pl-count');
  const totalMs = reduced ? 300 : 750;
  const startMs = reduced ? 0 : 150;
  const t0 = performance.now();
  function tick(now){
    const p = Math.min(1, Math.max(0, (now - t0 - startMs) / totalMs));
    if(counter) counter.textContent = String(Math.round(p * 99)).padStart(2,'0');
    if(p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Timeline minimalista:
  // 1. Aparecen los metadatos y el nombre (0-1s)
  // 2. Línea de progreso llena en 1.6s
  // 3. Hold breve (200ms) para que el ojo aterrice
  // 4. Fade out completo (500ms) revelando el portfolio
  // Total: ~2.3s
  let done = false;
  function finish(){
    if(done) return; done = true;
    pl.classList.add('pl-out');
    document.documentElement.classList.remove('pl-locked');
    document.body.classList.remove('pl-locked');
    setTimeout(()=>{
      pl.classList.add('pl-gone');
      pl.remove();
    }, 550);
  }
  const holdMs = reduced ? 400 : 900; // el preloader retrasaba el LCP ~3s
  setTimeout(finish, holdMs);

  // Skip con click o tecla
  function skip(){ if(!done) finish(); }
  pl.addEventListener('pointerdown', skip);
  window.addEventListener('keydown', e=>{
    if(e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') skip();
  });
})();

function applyLang(l){
  LANG=l;
  const t=T[l];
  if(!t) return;
  document.querySelectorAll('[data-i]').forEach(el=>{
    const k=el.dataset.i;
    if(t[k]!==undefined) el.innerHTML=t[k];
  });
  document.querySelectorAll('[data-lang]:not(.lang-opt)').forEach(b=>{
    b.classList.toggle('on',b.dataset.lang===l);
  });
  document.documentElement.lang=l;
  // Re-split hero title chars after translation (preserves char animation)
  if(typeof window.__splitAll === 'function') window.__splitAll();
}

const LANG_NAMES = { es:'Español', ca:'Català', en:'English' };

function playLangCurtain(lang){
  const c = document.getElementById('lang-curtain');
  const label = document.getElementById('lang-curtain-label');
  if(!c || !label) return applyLang(lang);
  label.textContent = LANG_NAMES[lang] || lang.toUpperCase();
  c.classList.remove('open'); c.classList.add('active','close');
  // Apply lang mid-curtain (when both panels meet)
  window.setTimeout(()=>{
    applyLang(lang);
  }, 380);
  window.setTimeout(()=>{
    c.classList.remove('close'); c.classList.add('open');
  }, 780);
  window.setTimeout(()=>{
    c.classList.remove('active','open');
  }, 1500);
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-lang]');
  if(b){
    e.preventDefault();
    const l = b.dataset.lang;
    if(l !== LANG) playLangCurtain(l);
    else applyLang(l);
  }
});


document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"], a[href^="/#"]');
  if(!a) return;
  const href = a.getAttribute('href');
  const hash = href.startsWith('/#') ? href.slice(1) : href;
  const target = hash.length > 1 ? document.querySelector(hash) : null;
  if(!target) return;
  e.preventDefault();
  if(mob && mob.classList.contains('open')) closeMob();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.pushState(null, '', hash);
});

applyLang(LANG);

/* ═══════════════════════════════════════
   CURSOR SWITCH — Normal / Mira
═══════════════════════════════════════ */
try {
(()=>{
  const sw = document.getElementById('cur-switch');
  const trg = document.getElementById('cur-trigger');
  const panel = document.getElementById('cur-panel');
  if(!sw || !trg || !panel) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let mode = 'normal';

  function setMode(m){
    mode = m;
    document.body.setAttribute('data-cursor', m);
    try { localStorage.setItem('cursor_mode', m); } catch(e){}
    panel.querySelectorAll('.cur-opt').forEach(o=>{
      const on = o.dataset.cur === m;
      o.classList.toggle('on', on);
      o.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  let initial = 'normal';
  try {
    const saved = localStorage.getItem('cursor_mode');
    if(saved && ['normal','mira'].includes(saved)) initial = saved;
  } catch(e){}
  if(reduced) initial = 'normal';
  setMode(initial);

  // Dropdown toggle
  trg.addEventListener('click', e=>{
    e.stopPropagation();
    const open = sw.classList.toggle('open');
    trg.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', e=>{
    if(!sw.contains(e.target)){ sw.classList.remove('open'); trg.setAttribute('aria-expanded','false'); }
  });
  panel.querySelectorAll('.cur-opt').forEach(o=>{
    o.addEventListener('click', ()=>{
      setMode(o.dataset.cur);
      sw.classList.remove('open');
      trg.setAttribute('aria-expanded','false');
    });
  });

  // Crosshair (modo mira): actualiza --mx/--my del body con la posición del ratón
  document.addEventListener('mousemove', e=>{
    if(mode !== 'mira') return;
    document.body.style.setProperty('--mx', e.clientX + 'px');
    document.body.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });
})();
} catch(err) {
  console.warn('[cursor-switch] init failed:', err);
}

/* ═══════════════════════════════════════
   NAV PILL — píldora que se desliza (rodd.es style)
═══════════════════════════════════════ */
(()=>{
  const nav = document.getElementById('nav-links');
  const pill = document.getElementById('nav-pill');
  if(!nav || !pill) return;
  const links = Array.from(nav.querySelectorAll('a'));
  if(!links.length) return;

  let activeEl = null;

  function moveTo(el, showPill){
    if(!el){ pill.style.setProperty('--pill-o', '0'); return; }
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    pill.style.setProperty('--pill-x', (elRect.left - navRect.left) + 'px');
    pill.style.setProperty('--pill-w', elRect.width + 'px');
    pill.style.setProperty('--pill-o', showPill ? '1' : '0');
  }

  function hoveredOrActive(){
    return links.find(l => l.dataset.hover === '1') || activeEl;
  }

  links.forEach(l=>{
    l.addEventListener('mouseenter', ()=>{
      links.forEach(x=>x.removeAttribute('data-hover'));
      l.setAttribute('data-hover', '1');
      moveTo(l, true);
    });
    l.addEventListener('focus', ()=>{
      links.forEach(x=>x.removeAttribute('data-hover'));
      l.setAttribute('data-hover', '1');
      moveTo(l, true);
    });
  });
  nav.addEventListener('mouseleave', ()=>{
    links.forEach(x=>x.removeAttribute('data-hover'));
    if(activeEl) moveTo(activeEl, true);
    else pill.style.setProperty('--pill-o', '0');
  });

  // Scroll spy: marca .act al link cuyo #id está más arriba en el viewport
  const sections = links
    .map(l => ({ link: l, sec: document.querySelector(l.getAttribute('href')) }))
    .filter(x => x.sec);

  function updateActive(){
    const y = window.scrollY + window.innerHeight * 0.35;
    let curr = null;
    for(const s of sections){
      const top = s.sec.getBoundingClientRect().top + window.scrollY;
      if(top <= y) curr = s;
    }
    const newActive = curr ? curr.link : null;
    if(newActive === activeEl) return;
    if(activeEl) activeEl.classList.remove('act');
    activeEl = newActive;
    if(activeEl) activeEl.classList.add('act');
    if(!hoveredOrActive() || !links.some(l=>l.dataset.hover === '1')){
      if(activeEl) moveTo(activeEl, true);
    }
  }

  // Scrolled state para activar backdrop-blur en el pill nav
  const navEl = document.getElementById('nav');
  function onScroll(){
    if(navEl){
      const s = window.scrollY > 40;
      navEl.classList.toggle('scrolled', s);
    }
    updateActive();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', ()=>{
    const t = hoveredOrActive();
    if(t) moveTo(t, true);
  });
  // Inicial
  requestAnimationFrame(()=>{ onScroll(); });
})();

/* ═══════════════════════════════════════
   SPLIT-TEXT — anima chars del título del hero (rodd.es style)
   Re-splitea tras cada cambio de idioma para no romper la traducción
═══════════════════════════════════════ */
(()=>{
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function splitOne(el){
    if(el.classList.contains('split-chars')) return;
    const raw = el.innerHTML;
    const parts = raw.split(/(<br\s*\/?\s*>)/i);
    let out = '';
    parts.forEach(p=>{
      if(/^<br/i.test(p)){ out += p; return; }
      const words = p.split(/(\s+)/);
      words.forEach(w=>{
        if(/^\s+$/.test(w)){ out += ' '; return; }
        if(!w) return;
        out += '<span class="sc-word">' + w.split('').map(c=>`<span class="sc-char">${c === ' ' ? '&nbsp;' : c}</span>`).join('') + '</span>';
      });
    });
    el.innerHTML = out;
    el.classList.add('split-chars');
    const chars = el.querySelectorAll('.sc-char');
    chars.forEach((c,i)=>{ c.style.transitionDelay = (Math.min(i,40) * 22) + 'ms'; });
    if(reduced) el.classList.add('vis');
  }
  function splitAll(){
    // Hero title spans only (safe scope — no data-i inside translation cycles)
    document.querySelectorAll('#hero-title span[data-i]').forEach(splitOne);
    // Auto-reveal chars right away for the hero
    requestAnimationFrame(()=>{
      document.querySelectorAll('#hero-title .split-chars').forEach(sc=>sc.classList.add('vis'));
    });
  }
  window.__splitAll = splitAll;
  splitAll();
})();

/* ═══════════════════════════════════════
   CERTIFICATE LIGHTBOX — abre PDFs en horizontal fullscreen
═══════════════════════════════════════ */
(()=>{
  const lb = document.getElementById('cert-lightbox');
  if(!lb) return;
  const iframe = lb.querySelector('#cert-lb-iframe');
  const title = lb.querySelector('#cert-lb-title');
  const badge = lb.querySelector('#cert-lb-badge');
  const dl = lb.querySelector('#cert-lb-download');
  const ext = lb.querySelector('#cert-lb-openext');
  const closeBtn = lb.querySelector('#cert-lb-close');

  const META = {
    'Certificado%20EBIS%20IA': { badge: '★ Máster · 10/10', title: 'Máster en Agentes de IA e Hiperautomatización de Procesos · EBIS' },
    'Neoland': { badge: 'Bootcamp UX/UI · 600h', title: 'Bootcamp UX/UI Design — Professional Track · Neoland Madrid' },
    'Duoc': { badge: 'Formación técnica', title: 'Desarrollo Web Multimedia y Administración Digital · CIPSA · Duoc UC' },
  };

  function keyFromUrl(url){
    const clean = decodeURIComponent(url.split('/').pop() || '').replace(/\.pdf$/i,'');
    const cleanEnc = url.split('/').pop().replace(/\.pdf$/i,'');
    return META[cleanEnc] ? cleanEnc : (META[clean] ? clean : null);
  }

  function openCert(url, ctx){
    lb.classList.remove('cert-lb-error');
    const key = keyFromUrl(url);
    const meta = key && META[key];
    badge.textContent = (meta && meta.badge) || (ctx && ctx.badge) || 'Certificado';
    title.textContent = (meta && meta.title) || (ctx && ctx.title) || 'Certificado';
    dl.href = url;
    ext.href = url;
    // Force landscape-friendly page fitting
    iframe.src = url + '#view=FitH&toolbar=1&navpanes=0';
    if(typeof lb.showModal === 'function') lb.showModal();
    else lb.setAttribute('open','');
    document.documentElement.style.overflow = 'hidden';
  }

  function closeCert(){
    if(typeof lb.close === 'function') lb.close();
    else lb.removeAttribute('open');
    iframe.src = 'about:blank';
    document.documentElement.style.overflow = '';
  }

  document.addEventListener('click', e=>{
    const a = e.target.closest('a.edu-cert');
    if(!a) return;
    // Skip external verification (blockchain) button
    if(a.classList.contains('edu-cert-alt')) return;
    const url = a.getAttribute('href') || '';
    if(!/\.pdf(\?|#|$)/i.test(url)) return;
    e.preventDefault();
    const context = {
      title: a.querySelector('span')?.textContent?.trim() || null,
    };
    openCert(url, context);
  });

  closeBtn?.addEventListener('click', closeCert);
  lb.addEventListener('click', e=>{
    // click on backdrop closes
    if(e.target === lb) closeCert();
  });
  lb.addEventListener('cancel', e=>{ e.preventDefault(); closeCert(); });
  iframe.addEventListener('error', ()=> lb.classList.add('cert-lb-error'));
})();

/* ═══════════════════════════════════════
   LIGHT RAYS — WebGL via OGL
═══════════════════════════════════════ */
(()=>{
  const canvas = document.getElementById('lr-canvas');
  if(!canvas) return;

  function initLR(){
    if(typeof window.ogl === 'undefined'){
      setTimeout(initLR, 120);
      return;
    }
    const { Renderer, Program, Triangle, Mesh } = window.ogl;
    let renderer, mesh, uniforms, animId;
    let mousePos = {x:.5, y:.5};
    let smoothMouse = {x:.5, y:.5};

    const hexToRgb = hex => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return m ? [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255] : [1,1,1];
    };

    const vert = `attribute vec2 position; varying vec2 vUv; void main(){vUv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
    const frag = `precision highp float; uniform float iTime; uniform vec2 iResolution; uniform vec2 rayPos; uniform vec2 rayDir; uniform vec3 raysColor; uniform float raysSpeed; uniform float lightSpread; uniform float rayLength; uniform float fadeDistance; uniform vec2 mousePos; uniform float mouseInfluence; uniform float distortion; varying vec2 vUv;
float rayStrength(vec2 raySource,vec2 rayRefDirection,vec2 coord,float seedA,float seedB,float speed){
  vec2 s2c=coord-raySource; vec2 dn=normalize(s2c); float cosA=dot(dn,rayRefDirection);
  float da=cosA+distortion*sin(iTime*2.+length(s2c)*.01)*.2; float sf=pow(max(da,0.),1./max(lightSpread,.001));
  float dist=length(s2c); float maxDist=iResolution.x*rayLength; float lf=clamp((maxDist-dist)/maxDist,0.,1.);
  float ff=clamp((iResolution.x*fadeDistance-dist)/(iResolution.x*fadeDistance),.5,1.);
  float bs=clamp((.45+.15*sin(da*seedA+iTime*speed))+(.3+.2*cos(-da*seedB+iTime*speed)),0.,1.);
  return bs*lf*ff*sf;
}
void main(){
  vec2 coord=vec2(gl_FragCoord.x,iResolution.y-gl_FragCoord.y); vec2 frd=rayDir;
  if(mouseInfluence>0.){ vec2 msp=mousePos*iResolution.xy; vec2 md=normalize(msp-rayPos); frd=normalize(mix(rayDir,md,mouseInfluence)); }
  vec4 r1=vec4(1.)*rayStrength(rayPos,frd,coord,36.2214,21.11349,1.5*raysSpeed);
  vec4 r2=vec4(1.)*rayStrength(rayPos,frd,coord,22.3991,18.0234,1.1*raysSpeed);
  vec4 fc=r1*.5+r2*.4; float br=1.-(coord.y/iResolution.y); fc.x*=.1+br*.8;fc.y*=.3+br*.6;fc.z*=.5+br*.5; fc.rgb*=raysColor; gl_FragColor=fc;
}`;

    function setup(){
      if(renderer) return;
      try{
        renderer = new Renderer({canvas, dpr:Math.min(devicePixelRatio,2), alpha:true});
        const gl = renderer.gl;
        uniforms = {
          iTime:{value:0}, iResolution:{value:[1,1]}, rayPos:{value:[0,0]}, rayDir:{value:[0,1]},
          raysColor:{value:hexToRgb('#00d4d4')}, raysSpeed:{value:1.4}, lightSpread:{value:.65},
          rayLength:{value:1.5}, fadeDistance:{value:1.0}, mousePos:{value:[.5,.5]}, mouseInfluence:{value:.12}, distortion:{value:.04}
        };
        const geometry = new Triangle(gl);
        const program = new Program(gl, {vertex:vert, fragment:frag, uniforms});
        mesh = new Mesh(gl, {geometry, program});
        resize();
      } catch(e){}
    }

    function resize(){
      if(!renderer || !canvas) return;
      const w=canvas.clientWidth, h=canvas.clientHeight;
      renderer.setSize(w, h);
      const dpr=renderer.dpr;
      uniforms.iResolution.value=[w*dpr, h*dpr];
      uniforms.rayPos.value=[w*dpr*.5, -h*dpr*.18];
      uniforms.rayDir.value=[0,1];
    }

    function loop(t){
      if(!renderer || !mesh || !uniforms){ animId=requestAnimationFrame(loop); return; }
      if(document.body.classList.contains('is-scrolling')) {
        animId=requestAnimationFrame(loop);
        return;
      }
      uniforms.iTime.value=t*.001;
      smoothMouse.x=smoothMouse.x*.92+mousePos.x*.08;
      smoothMouse.y=smoothMouse.y*.92+mousePos.y*.08;
      uniforms.mousePos.value=[smoothMouse.x,smoothMouse.y];
      const theme=document.documentElement.getAttribute('data-theme');
      if(theme==='saas') uniforms.raysColor.value=hexToRgb('#00d4d4');
      try{ renderer.render({scene:mesh}); } catch(e){}
      animId=requestAnimationFrame(loop);
    }

    function show(){ canvas.style.opacity='0.4'; setup(); animId=requestAnimationFrame(loop); }
    function hide(){ canvas.style.opacity='0'; if(animId){cancelAnimationFrame(animId);animId=null;} }

    window.addEventListener('mousemove', e=>{
      const rect = canvas.getBoundingClientRect();
      mousePos.x=(e.clientX-rect.left)/rect.width;
      mousePos.y=(e.clientY-rect.top)/rect.height;
    },{passive:true});
    window.addEventListener('resize',resize,{passive:true});

    const moTarget = document.documentElement;
    if(moTarget && moTarget.nodeType === 1){
      const mo=new MutationObserver(()=>{
        const th=moTarget.getAttribute('data-theme');
        if(th==='saas') show(); else hide();
      });
      mo.observe(moTarget,{attributes:true,attributeFilter:['data-theme']});
    }

    const th=document.documentElement.getAttribute('data-theme');
    if(th==='saas'){ show(); } else { hide(); }

    document.addEventListener('visibilitychange',()=>{
      if(document.hidden&&animId){ cancelAnimationFrame(animId);animId=null; }
      else if(!document.hidden&&document.documentElement.getAttribute('data-theme')==='saas'){ animId=requestAnimationFrame(loop); }
    });
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',initLR); } else { initLR(); }
})();

/* ═══════════════════════════════════════
   ANIMACIONES DE FONDO 2D (CANVAS)
═══════════════════════════════════════ */
(()=>{
  const cv=document.getElementById('bg-cv');
  const ctx=cv.getContext('2d');
  let W,H;
  function rsz(){W=cv.width=innerWidth;H=cv.height=innerHeight;initAll()}
  window.addEventListener('resize',rsz,{passive:true});

  /* SAAS */
  const SR={rays:[]};
  function initSaas(){
    SR.rays=[];
    for(let i=0;i<16;i++) SR.rays.push({
      a:-Math.PI/2+(i/15-.5)*Math.PI*.7, w:90+Math.random()*200,al:.015+Math.random()*.022,
      sp:.00016+Math.random()*.0002,ph:Math.random()*Math.PI*2,
      wb:(Math.random()-.5)*.012,len:.5+Math.random()*.48,
      c:Math.random()>.5?'0,212,212':'255,51,51' 
    });
  }
  function drawSaas(t,mx,my){
    const ox=W*(.22+mx*.55),oy=H*(-.07+my*.04);
    SR.rays.forEach(r=>{
      const a=r.a+Math.sin(t*r.sp*3000+r.ph)*r.wb+(mx-.5)*.11;
      const p=.5+.5*Math.sin(t*r.sp*4100+r.ph*1.5);
      const al=r.al*p;
      const ex=ox+Math.cos(a)*W*r.len,ey=oy+Math.sin(a)*H*r.len*1.35;
      const g=ctx.createLinearGradient(ox,oy,ex,ey);
      g.addColorStop(0,`rgba(${r.c},${(al*2).toFixed(3)})`);
      g.addColorStop(.3,`rgba(${r.c},${(al*.65).toFixed(3)})`);
      g.addColorStop(.75,`rgba(${r.c},${(al*.15).toFixed(3)})`);
      g.addColorStop(1,`rgba(${r.c},0)`);
      const hw=(r.w*(.28+.72*p))/2;
      const px=Math.cos(a+Math.PI/2),py=Math.sin(a+Math.PI/2);
      ctx.save();ctx.globalCompositeOperation='screen';
      ctx.beginPath(); ctx.moveTo(ox+px*1.2,oy+py*1.2); ctx.lineTo(ex+px*hw,ey+py*hw); ctx.lineTo(ex-px*hw,ey-py*hw);
      ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.restore();
    });
  }

  /* CYBER */
  const CP={ps:[]};
  function initCyber(){CP.ps=[];}
  function drawCyber(t){
    if(Math.random()<.006) CP.ps.push({
      ax:Math.random()>.5?'h':'v', tr:Math.floor(Math.random()*(Math.max(W,H)/80))*80,
      pos:0,sp:.25+Math.random()*.35, len:55+Math.random()*100, c:Math.random()>.55?'0,240,255':'176,38,255'
    });
    CP.ps=CP.ps.filter(p=>{
      p.pos+=p.sp;
      const mx2=p.ax==='h'?W:H;
      if(p.pos-p.len>mx2) return false;
      const g=p.ax==='h' ? ctx.createLinearGradient(p.pos-p.len,0,p.pos+p.len,0) : ctx.createLinearGradient(0,p.pos-p.len,0,p.pos+p.len);
      g.addColorStop(0,`rgba(${p.c},0)`); g.addColorStop(.45,`rgba(${p.c},.82)`); g.addColorStop(.55,`rgba(${p.c},.82)`); g.addColorStop(1,`rgba(${p.c},0)`);
      ctx.save();ctx.globalCompositeOperation='screen'; ctx.strokeStyle=g;ctx.lineWidth=2; ctx.beginPath();
      if(p.ax==='h'){ctx.moveTo(Math.max(0,p.pos-p.len),p.tr);ctx.lineTo(Math.min(W,p.pos+p.len),p.tr);}
      else{ctx.moveTo(p.tr,Math.max(0,p.pos-p.len));ctx.lineTo(p.tr,Math.min(H,p.pos+p.len));}
      ctx.stroke();
      const cx2=p.ax==='h'?p.pos:p.tr,cy2=p.ax==='h'?p.tr:p.pos;
      const gw=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,15);
      gw.addColorStop(0,`rgba(${p.c},.95)`);gw.addColorStop(1,`rgba(${p.c},0)`);
      ctx.fillStyle=gw;ctx.beginPath();ctx.arc(cx2,cy2,15,0,Math.PI*2);ctx.fill(); ctx.restore(); return true;
    });
  }

  function initAll(){initSaas();initCyber();}
  rsz();

  let mx=.5,my=.5;
  window.addEventListener('mousemove',e=>{mx=e.clientX/W;my=e.clientY/H},{passive:true});
  const OP={saas:.55,editorial:.88,cyber:1,diario:.88,hud:.75};
  let raf,t=0;
  function draw(ts){
    if(document.body.classList.contains('is-scrolling')) {
      raf=requestAnimationFrame(draw);
      return;
    }
    t=ts*.001;
    const th=document.documentElement.getAttribute('data-theme')||'saas';
    cv.style.opacity=OP[th]||.82;
    ctx.clearRect(0,0,W,H);
    if(th==='saas') drawSaas(t,mx,my);
    else if(th==='cyber') drawCyber(t);
    raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden)cancelAnimationFrame(raf); else raf=requestAnimationFrame(draw); });
})();

/* ═══════════════════════════════════════
   CURSOR LIGERO — dot rápido + halo on-hover únicamente
   (el anillo perseguidor causaba lag; ahora solo se activa sobre CTAs)
═══════════════════════════════════════ */
(()=>{
  if(window.innerWidth<=1024||matchMedia('(pointer:coarse)').matches) return;
  const cur=document.getElementById('cur');
  const curR=document.getElementById('cur-r');
  if(!cur||!curR) return;

  const lbl=document.createElement('span');
  lbl.id='cur-label';
  curR.appendChild(lbl);

  document.body.classList.add('has-custom-cursor');

  // Un solo rAF loop, transform-based, sin reflow
  let mx=0,my=0,rx=0,ry=0,ticking=false;
  function tick(){
    // Ease del halo (más rápido que antes: 0.28 en vez de 0.1)
    rx += (mx - rx) * 0.28;
    ry += (my - ry) * 0.28;
    cur.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    curR.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    if(Math.abs(mx-rx) > .1 || Math.abs(my-ry) > .1){
      requestAnimationFrame(tick);
    } else {
      ticking = false;
    }
  }
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if(!ticking){ ticking = true; requestAnimationFrame(tick); }
  }, {passive:true});
  document.addEventListener('mouseleave', ()=>{ cur.style.opacity='0'; curR.style.opacity='0'; });
  document.addEventListener('mouseenter', ()=>{ cur.style.opacity=''; curR.style.opacity=''; });

  const CUR_STATES=['cur-btn','cur-card'];
  function setState(s,label=''){
    CUR_STATES.forEach(c=>document.body.classList.remove(c));
    if(s) document.body.classList.add(s);
    lbl.textContent=label;
  }

  // Delegación de eventos: un solo listener global, escala mejor que N listeners por elemento
  const BTN_SELECTOR = 'button:not(.bc):not(.lab-card),.nav-cta,.btn-p,.btn-s,.dk,.tc,.fb,.nlb,.mlb,.sc-hd,.tl-hd,.edu-hd,.bc-link,.tli,#fcta,#mob-x,#ham,.nav-links a,.lang-trigger,.lang-opt,.edu-cert,.cert-lb-btn,.cert-lb-close-btn';
  const CARD_SELECTOR = '.bc,.lab-card,.lab-feat,.pcard';

  let currentHover = null;
  document.addEventListener('mouseover', e => {
    const btn = e.target.closest(BTN_SELECTOR);
    const card = !btn ? e.target.closest(CARD_SELECTOR) : null;
    const t = btn || card;
    if(t === currentHover) return;
    currentHover = t;
    if(btn) setState('cur-btn');
    else if(card){
      const isSite = card.classList.contains('lab-feat');
      setState('cur-card', isSite ? 'Visitar →' : 'Ver →');
    } else setState('');
  });

  // Cursor-follow spotlight en tarjetas destacadas — usa delegación
  const spotlightCards = document.querySelectorAll('.bfeat .bc, .lab-feat');
  spotlightCards.forEach(el => {
    let raf = 0;
    el.addEventListener('mousemove', ev => {
      if(raf) return;
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((ev.clientX-r.left)/r.width*100)+'%');
        el.style.setProperty('--my', ((ev.clientY-r.top)/r.height*100)+'%');
        raf = 0;
      });
    }, {passive:true});
    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--mx','50%');
      el.style.setProperty('--my','50%');
    });
  });

  document.addEventListener('mousedown',()=>document.body.classList.add('c-click'));
  document.addEventListener('mouseup',()=>document.body.classList.remove('c-click'));

  // Efecto magnético en botones primarios
  document.querySelectorAll('.btn-p,.nav-cta,#fcta').forEach(btn=>{
    const R=72, S=0.3;
    btn.addEventListener('mousemove',e=>{
      const rect=btn.getBoundingClientRect();
      const dx=e.clientX-(rect.left+rect.width/2);
      const dy=e.clientY-(rect.top+rect.height/2);
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<R){ const p=(R-d)/R; btn.style.transform=`translate(${dx*S*p}px,${dy*S*p}px)`; btn.style.transition='transform 0.1s'; }
    });
    btn.addEventListener('mouseleave',()=>{ btn.style.transform=''; btn.style.transition='transform 0.5s var(--ease)'; });
  });

  // Ripple en clicks de botones
  document.querySelectorAll('.btn-p,.btn-s,.nav-cta,#fcta').forEach(btn=>{
    btn.addEventListener('click',e=>{
      const rect=btn.getBoundingClientRect();
      const rp=document.createElement('span');
      rp.className='rn-ripple';
      rp.style.left=(e.clientX-rect.left)+'px';
      rp.style.top=(e.clientY-rect.top)+'px';
      btn.appendChild(rp);
      setTimeout(()=>rp.remove(),700);
    });
  });
})();

document.querySelectorAll('.trigger-flash, .bc, .lab-card').forEach(el => {
  el.addEventListener('click', () => { document.body.classList.add('flashing'); setTimeout(() => document.body.classList.remove('flashing'), 100); });
});

/* ═══════════════════════════════════════
   SCROLL & REVEAL
═══════════════════════════════════════ */
const prog=document.getElementById('prog');
const nav=document.getElementById('nav');
const fcta=document.getElementById('fcta');
let scrollIdleTimer;
let scrollTicking=false;
window.addEventListener('scroll',()=>{
  document.body.classList.add('is-scrolling');
  clearTimeout(scrollIdleTimer);
  scrollIdleTimer=setTimeout(()=>document.body.classList.remove('is-scrolling'),90);
  if(scrollTicking) return;
  scrollTicking=true;
  requestAnimationFrame(()=>{
    const s=document.documentElement;
    const pct=(s.scrollTop/(s.scrollHeight-s.clientHeight))*100;
    if(prog)prog.style.width=Math.min(pct,100)+'%';
    if(nav)nav.classList.toggle('compact',scrollY>80);
    if(fcta)fcta.classList.toggle('show',scrollY>innerHeight*.35&&pct<96);
    scrollTicking=false;
  });
},{passive:true});

const rvIO=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');rvIO.unobserve(e.target)}});
},{threshold:.055,rootMargin:'0px 0px -18px 0px'});
document.querySelectorAll('.rv,.rv-l,.rv-s,.eyebrow').forEach(el=>rvIO.observe(el));

const navAs=document.querySelectorAll('.nav-links a');
document.querySelectorAll('section[id]').forEach(sec=>{
  new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) navAs.forEach(a=>a.classList.toggle('act',a.getAttribute('href')==='#'+e.target.id)); });
  },{threshold:.38}).observe(sec);
});

/* ═══════════════════════════════════════
   CONTADORES
═══════════════════════════════════════ */
const _counted = new WeakSet();
document.querySelectorAll('[data-target]').forEach(el=>{
  new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting || _counted.has(el)) return;
      _counted.add(el);
      const tgt=+el.dataset.target, suf=el.dataset.suffix||'', dur=1350;
      const start=performance.now();
      const step=()=>{ const p=Math.min((performance.now()-start)/dur,1); el.textContent=Math.round(p*tgt)+suf; if(p<1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  },{threshold:.5}).observe(el);
});

/* ═══════════════════════════════════════
   MARQUEE (Tools)
═══════════════════════════════════════ */
(()=>{
  const tools=[ {n:'Make',c:'mp2'},{n:'n8n',c:'mp2'},{n:'Botpress',c:'mp2'},{n:'Vapi',c:'mp2'}, {n:'Figma',c:'mp1'},{n:'React',c:'mp1'},{n:'Tailwind',c:'mp1'},{n:'WordPress',c:'mp1'}, {n:'Claude API',c:'mp2'},{n:'GPT-4o',c:'mp2'},{n:'ElevenLabs',c:'mp2'},{n:'Gemini AI',c:'mp2'}, {n:'Shopify',c:''},{n:'Node.js',c:''},{n:'Firebase',c:''},{n:'Framer',c:''}, {n:'GA4',c:'mp1'},{n:'Hotjar',c:''},{n:'Notion',c:''},{n:'Excel Avanzado',c:'mp1'} ];
  const inner=document.getElementById('mq-i');
  if(!inner)return;
  const html=tools.map(t=>`<span class="mpill ${t.c}">${t.n}</span>`).join('');
  inner.innerHTML=html+html;
})();

/* ═══════════════════════════════════════
   MOBILE MENU & ACORDEONES & BENTO
═══════════════════════════════════════ */
const ham=document.getElementById('ham');
const mob=document.getElementById('mob');
const mobX=document.getElementById('mob-x');
function openMob(){mob.classList.add('open');ham.classList.add('open');ham.setAttribute('aria-expanded','true');document.body.style.overflow='hidden'}
function closeMob(){mob.classList.remove('open');ham.classList.remove('open');ham.setAttribute('aria-expanded','false');document.body.style.overflow=''}
if(ham) ham.addEventListener('click',()=>mob.classList.contains('open')?closeMob():openMob());
if(mobX) mobX.addEventListener('click',closeMob);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mob&&mob.classList.contains('open'))closeMob()});
mob&&mob.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMob));
window.addEventListener('pageshow',()=>{ if(!mob || !mob.classList.contains('open')) document.body.style.overflow=''; });
window.addEventListener('resize',()=>{ if(window.innerWidth >= 980 && mob && mob.classList.contains('open')) closeMob(); },{passive:true});
window.addEventListener('hashchange',()=>{ if(!mob || !mob.classList.contains('open')) document.body.style.overflow=''; });

document.querySelectorAll('.sc-hd').forEach(hd=>hd.addEventListener('click',()=>hd.closest('.sc').classList.toggle('open')));
document.querySelectorAll('.tl-hd').forEach(hd=>hd.addEventListener('click',()=>{ const tl=hd.closest('.tl'); const wasOpen=tl.classList.contains('open'); document.querySelectorAll('.tl.open').forEach(o=>o.classList.remove('open')); if(!wasOpen)tl.classList.add('open'); }));
document.querySelectorAll('.edu-hd').forEach(hd=>hd.addEventListener('click',()=>hd.closest('.edu').classList.toggle('open')));

function setAG(){ const g=document.getElementById('about-grid'); if(g)g.style.gridTemplateColumns=innerWidth>=920?'1.2fr 1fr':'1fr'; }
setAG();window.addEventListener('resize',setAG,{passive:true});


const cbox=document.querySelector('.contact-box');
if(cbox){
  cbox.addEventListener('mousemove',e=>{
    const r=cbox.getBoundingClientRect();
    cbox.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
    cbox.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
  });
}

const tiltCards = document.querySelectorAll('.bc, .lab-card, .pcard');
tiltCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    if (window.innerWidth < 768) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const centerX = rect.width / 2; const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8; const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.transition = 'none'; card.style.zIndex = '10';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = ''; card.style.transition = 'transform 0.5s var(--ease)'; card.style.zIndex = '1';
  });
});

/* Temas, avatar por tema y filtro/plegado de proyectos viven en las islas React (src/islands/).
   Aqui solo se cierra el menu movil cuando una isla cambia el tema. */
window.addEventListener('rn-theme',()=>{ if(mob.classList.contains('open')) closeMob(); });

/* ═══════════════════════════════════════
   MUSIC PLAYER
═══════════════════════════════════════ */
(function(){
  const audio   = document.getElementById('rn-audio');
  const heroBtn = document.getElementById('btn-music');
  const player  = document.getElementById('music-player');
  if(!audio||!heroBtn||!player) return;

  const playBtn  = document.getElementById('mp-play');
  const muteBtn  = document.getElementById('mp-mute');
  const closeBtn = document.getElementById('mp-close');
  const fill     = document.getElementById('mp-fill');
  const timeEl   = document.getElementById('mp-time');

  audio.volume = 0.38;
  audio.loop   = true;
  let activated = false;

  const SVG_PLAY  = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const SVG_PAUSE = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
  const SVG_VOL   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';
  const SVG_MUTE  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
  const SVG_NOTE  = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';

  function setHeroState(s){
    heroBtn.dataset.state = s;
    if(s==='idle'){
      heroBtn.innerHTML = SVG_NOTE+' Activar música';
      heroBtn.setAttribute('aria-label','Activar música de fondo');
    } else if(s==='playing'){
      heroBtn.innerHTML = SVG_PAUSE+' Pausar';
      heroBtn.setAttribute('aria-label','Pausar música');
    } else {
      heroBtn.innerHTML = SVG_PLAY+' Reanudar';
      heroBtn.setAttribute('aria-label','Reanudar música');
    }
  }

  function showPlayer(){
    player.hidden = false;
    requestAnimationFrame(()=> player.classList.add('visible'));
  }

  function syncPlay(){
    playBtn.innerHTML = audio.paused ? SVG_PLAY : SVG_PAUSE;
    playBtn.setAttribute('aria-label', audio.paused ? 'Reanudar' : 'Pausar');
  }

  function syncMute(){
    muteBtn.innerHTML = audio.muted ? SVG_MUTE : SVG_VOL;
    muteBtn.setAttribute('aria-label', audio.muted ? 'Activar sonido' : 'Silenciar');
  }

  heroBtn.addEventListener('click', ()=>{
    if(!activated){
      activated = true;
      audio.play().then(()=>{
        setHeroState('playing');
        showPlayer(); syncPlay(); syncMute();
      }).catch(()=>{ activated = false; });
    } else if(audio.paused){
      audio.play().then(()=>{
        setHeroState('playing'); syncPlay();
        if(player.hidden) showPlayer();
      });
    } else {
      audio.pause();
      setHeroState('paused'); syncPlay();
    }
  });

  playBtn.addEventListener('click', ()=>{
    if(audio.paused){
      audio.play().then(()=>{ setHeroState('playing'); syncPlay(); });
    } else {
      audio.pause(); setHeroState('paused'); syncPlay();
    }
  });

  muteBtn.addEventListener('click', ()=>{ audio.muted=!audio.muted; syncMute(); });

  closeBtn.addEventListener('click', ()=>{
    audio.pause(); audio.currentTime=0;
    activated = false;
    player.classList.remove('visible');
    setTimeout(()=>{ player.hidden=true; }, 400);
    setHeroState('idle');
  });

  audio.addEventListener('timeupdate', ()=>{
    if(!audio.duration) return;
    fill.style.width = (audio.currentTime/audio.duration*100)+'%';
    const s = Math.floor(audio.currentTime%60).toString().padStart(2,'0');
    timeEl.textContent = Math.floor(audio.currentTime/60)+':'+s;
  });

  syncMute();
  setHeroState('idle');
})();
/* Foto de perfil con vida: órbita + pulso + inclinación con muelle (decorativo, solo puntero fino) */
const avWrap = document.querySelector('.av-wrap');
if (avWrap) {
  ['av-pulse', 'av-orbit'].forEach(c => { const i = document.createElement('i'); i.className = c; i.setAttribute('aria-hidden', 'true'); avWrap.appendChild(i); });
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  if (fine.matches && !calm.matches) {
    const host = avWrap.closest('.pcard') || avWrap;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const tick = () => {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;   // muelle suave: la imagen tiene inercia
      avWrap.style.transform = `perspective(900px) rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
      raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.02) ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    host.addEventListener('pointermove', e => {
      const r = host.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 14;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 14;
      kick();
    });
    host.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  }
}
