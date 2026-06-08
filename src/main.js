import { T } from './content.js';

let LANG = 'es';

function applyLang(l){
  LANG=l;
  const t=T[l];
  if(!t) return;
  document.querySelectorAll('[data-i]').forEach(el=>{
    const k=el.dataset.i;
    if(t[k]!==undefined) el.innerHTML=t[k];
  });
  document.querySelectorAll('[data-lang]').forEach(b=>{
    b.classList.toggle('on',b.dataset.lang===l);
  });
  document.documentElement.lang=l;
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-lang]');
  if(b){e.preventDefault();applyLang(b.dataset.lang);}
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
   CURSOR MULTI-ESTADO
═══════════════════════════════════════ */
(()=>{
  if(window.innerWidth<=1024||matchMedia('(pointer:coarse)').matches) return;
  const cur=document.getElementById('cur');
  const curR=document.getElementById('cur-r');
  if(!cur||!curR) return;

  // Label dinámico dentro del anillo
  const lbl=document.createElement('span');
  lbl.id='cur-label';
  curR.appendChild(lbl);

  document.body.classList.add('has-custom-cursor');

  let cx=0,cy=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{
    cx=e.clientX; cy=e.clientY;
    cur.style.left=cx+'px'; cur.style.top=cy+'px';
  },{passive:true});
  document.addEventListener('mouseleave',()=>{ cur.style.opacity='0'; curR.style.opacity='0'; });
  document.addEventListener('mouseenter',()=>{ cur.style.opacity=''; curR.style.opacity=''; });

  // Anillo con lerp suave
  (function animR(){
    rx+=(cx-rx)*.1; ry+=(cy-ry)*.1;
    curR.style.left=rx+'px'; curR.style.top=ry+'px';
    requestAnimationFrame(animR);
  })();

  // Gestión de estados
  const CUR_STATES=['cur-btn','cur-card'];
  function setState(s,label=''){
    CUR_STATES.forEach(c=>document.body.classList.remove(c));
    if(s) document.body.classList.add(s);
    lbl.textContent=label;
  }

  // Interactivos: nav links, botones, filtros, acordeones, dock
  document.querySelectorAll([
    'button:not(.bc):not(.lab-card)','.nav-cta','.btn-p','.btn-s',
    '.dk','.tc','.fb','.nlb','.mlb','.sc-hd','.tl-hd','.edu-hd',
    '.bc-link','.tli','#fcta','#mob-x','#ham','.nav-links a'
  ].join(',')).forEach(el=>{
    el.addEventListener('mouseenter',()=>setState('cur-btn'));
    el.addEventListener('mouseleave',()=>setState(''));
  });

  // Tarjetas: anillo grande + etiqueta contextual
  document.querySelectorAll('.bc,.lab-card,.lab-feat,.pcard').forEach(el=>{
    const isSite=el.classList.contains('lab-feat');
    el.addEventListener('mouseenter',()=>setState('cur-card', isSite?'Visitar →':'Ver →'));
    el.addEventListener('mouseleave',()=>setState(''));
  });

  // Click feedback
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

document.querySelectorAll('.fb').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const f=btn.dataset.f;
    document.querySelectorAll('.fb').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    document.querySelectorAll('.bento>[data-cats],.bfeat[data-cats]').forEach(card=>{
      card.classList.toggle('fhid',f!=='all'&&!card.dataset.cats.split(' ').includes(f));
    });
  });
});

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

/* ═══════════════════════════════════════
   TEMAS MAPEO DE IMÁGENES Y BOTONES
═══════════════════════════════════════ */
const AVATARS={
  saas:'/assets/profile/fotoperfil0001.png',   // Estilo 1: SaaS (principal)
  editorial:'/assets/profile/fotoperfil0002.png', // Estilo 2: Diario Digital
  cyber:'/assets/legacy/foto-estilo3.png',     // Estilo 3: Cyber
  diario:'/assets/profile/perfilrod.png',      // Estilo 4: Minimal Journal
  hud:'/assets/profile/fotoperfil0003.png'     // Estilo 5: Fine Art
};

function applyTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  
  // Sincronizar todos los botones selectores (Dock, Menú Móvil y Footer)
  document.querySelectorAll('.dk, .tc').forEach(b => {
    b.classList.remove('on');
    if(b.dataset.t === t || b.dataset.tc === t) {
      b.classList.add('on');
    }
  });

  const av=document.getElementById('av');
  if(av && AVATARS[t]) av.src=AVATARS[t];
  sessionStorage.setItem('rn-theme',t);
  
  // Cerrar menú móvil si se clickeó desde ahí
  if(document.getElementById('mob').classList.contains('open')){
    closeMob();
  }
}

// Asignar eventos de click a TODOS los botones selectores
document.querySelectorAll('.dk, .tc').forEach(b=>{
  b.addEventListener('click', (e)=>{
    e.preventDefault();
    const t = b.dataset.t || b.dataset.tc;
    if(t) applyTheme(t);
  });
});

const savedT=sessionStorage.getItem('rn-theme');
if(savedT) applyTheme(savedT);
