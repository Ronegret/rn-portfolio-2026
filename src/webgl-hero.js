/* Firma WebGL del hero: aurora de ruido simplex con distorsion por puntero/toque y ondas de scroll. Se importa DINAMICAMENTE desde main.js solo si pasa la gobernanza.
   Decorativo: el CSS del hero (degradado) es siempre el fondo; si algo falla, el canvas simplemente no aparece. */
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const canvas = document.getElementById('lr-canvas');
const hero = document.getElementById('hero');
const root = document.documentElement;
const coarse = !matchMedia('(hover:hover) and (pointer:fine)').matches;

const VERT = 'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}';
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes,uM;uniform float uPhase,uWave,uEnergy,uStr;
uniform vec3 uC1,uC2,uC3;
vec3 pm(vec3 x){return x-floor(x*(1./289.))*289.;}
vec3 perm(vec3 x){return pm((x*34.+1.)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)),x0=v-i+dot(i,C.xx);
  vec2 i1=x0.x>x0.y?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;
  i=i-floor(i*(1./289.))*289.;
  vec3 p=perm(perm(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;
  vec3 x=2.*fract(p*C.www)-1.,h=abs(x)-.5,ox=floor(x+.5),a0=x-ox;
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}
vec4 field(vec2 q){
  float t=uPhase;
  q.y+=uWave*.14*sin(q.x*3.4+t*7.);
  float n1=snoise(q*.85+vec2(t*.5,-t*.3));
  float n2=snoise(q*1.45+vec2(n1,-n1)*.75+vec2(-t*.35,t*.25));
  float n3=snoise(q*2.1+n2*.8-t*.2);
  vec3 c=mix(uC1,uC2,smoothstep(-.7,.7,n2));
  c=mix(c,uC3,smoothstep(.15,.95,n3)*.5);
  return vec4(c,smoothstep(-.35,.95,n1+.4*n2));
}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  float asp=uRes.x/uRes.y;
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(uv-.5)*vec2(asp,1.)*1.7;
  vec2 m=(uM-.5)*vec2(asp,1.)*1.7;
  vec2 d=p-m;float g=exp(-dot(d,d)*2.2);
  p+=vec2(-d.y,d.x)*g*(.18+.5*uEnergy);
  vec4 f=field(p);
  float tm=asp>1.1?mix(.5,1.,smoothstep(.15,.7,uv.x)):.7; // zona del texto mas calmada
  float a=f.a*tm*mix(.45,1.,uv.y)*(1.-.35*smoothstep(.5,1.4,length(uv-vec2(.5,.9))*1.2));
  a=(a+g*.22*(.4+uEnergy))*uStr;
  vec3 col=f.rgb;
  a+=(hash(gl_FragCoord.xy)-.5)/255.;
  a=clamp(a,0.,1.);
  gl_FragColor=vec4(col*a,a);
}`;

/* --- paleta desde las variables CSS del tema vivo --- */
const parse = s => {
  s = s.trim();
  let m = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(s);
  if (m) { let h = m[1]; if (h.length === 3) h = h.replace(/./g, '$&$&'); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); }
  m = s.match(/[\d.]+/g);
  return m && m.length >= 3 ? m.slice(0, 3).map(v => v / 255) : [1, 1, 1];
};
const lum = c => .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
function readTheme() {
  const cs = getComputedStyle(root), v = k => parse(cs.getPropertyValue(k));
  let [a1, a2, a3] = [v('--a1'), v('--a2'), v('--a3')];
  const light = lum(v('--bg')) > .5;
  if (lum(a1) > .85 && !light) [a1, a2] = [a2, a1]; // acento blanco (saas): el color manda, el blanco solo da brillo
  if (light) { const mx = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t); a2 = mx(a2, a1, .6); a3 = mx(a3, a1, .5); } // papel claro: tintes de un solo acento, sin manchas grises
  return [...a1, ...a2, ...a3, light ? 1 : 0, light ? .2 : .3];
}

let renderer, program, mesh, raf = 0, running = false, dead = false, ready = false;
let cur = readTheme(), tgt = cur.slice();
const U = {
  uRes: { value: [1, 1] }, uM: { value: [.5, .5] }, uPhase: { value: 0 }, uWave: { value: 0 },
  uEnergy: { value: 0 }, uStr: { value: .5 },
  uC1: { value: [1, 1, 1] }, uC2: { value: [1, 1, 1] }, uC3: { value: [1, 1, 1] },
};
const base = coarse ? .55 : Math.min(devicePixelRatio || 1, 1.25);
const floorRes = coarse ? .3 : .5;
let res = base;
const mouse = { x: .5, y: .5, sx: .5, sy: .5, has: false, lx: .5, ly: .5 };
let energy = 0, wave = 0, lastY = scrollY, phase = 0, last = 0;
let acc = 0, frames = 0, warm = 0;

function resize() {
  if (!renderer) return;
  const w = hero.clientWidth, h = hero.clientHeight;
  renderer.dpr = res; canvas.dataset.res = res.toFixed(2);
  renderer.setSize(w, h);
  canvas.style.width = canvas.style.height = '100%';
  U.uRes.value = [renderer.gl.drawingBufferWidth, renderer.gl.drawingBufferHeight];
}

function frame(now) {
  raf = 0;
  if (!running) return;
  raf = requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, .1) || .016;
  const gap = now - last; last = now;
  // gobernador de fps: media de 30 fotogramas > 24 ms => bajar resolucion; si no basta, apagar
  if (warm < 8) warm++;
  else if (gap < 250) {
    acc += gap;
    if (++frames === 30) {
      const avg = acc / 30; acc = frames = 0;
      if (avg > 24) {
        if (res > floorRes * 1.01) { res = Math.max(floorRes, res * .75); resize(); warm = 4; }
        else return shutdown();
      }
    }
  }
  // entradas
  const dy = scrollY - lastY; lastY = scrollY;
  wave = Math.min(1, wave * Math.exp(-dt * 2.2) + Math.abs(dy) / (dt * 3200) * dt * 4);
  mouse.sx += (mouse.x - mouse.sx) * (1 - Math.exp(-dt * 5));
  mouse.sy += (mouse.y - mouse.sy) * (1 - Math.exp(-dt * 5));
  const sp = Math.hypot(mouse.sx - mouse.lx, mouse.sy - mouse.ly) / dt; mouse.lx = mouse.sx; mouse.ly = mouse.sy;
  energy = Math.min(1, energy * Math.exp(-dt * 1.6) + Math.min(sp, 3) * dt * 1.4 + Math.abs(dy) * .0006);
  phase += dt * (.045 + energy * .16); // en reposo casi quieto
  // tema: transicion de ~1 s
  const k = 1 - Math.exp(-dt * 3.4);
  for (let i = 0; i < cur.length; i++) cur[i] += (tgt[i] - cur[i]) * k;
  U.uC1.value = cur.slice(0, 3); U.uC2.value = cur.slice(3, 6); U.uC3.value = cur.slice(6, 9);
  U.uStr.value = cur[10];
  U.uPhase.value = phase; U.uWave.value = wave; U.uEnergy.value = energy;
  U.uM.value = [mouse.sx, mouse.sy];
  renderer.render({ scene: mesh });
  if (!ready) { ready = true; canvas.classList.add('is-on'); canvas.dataset.wgl = 'on'; }
}

function start() { if (dead || running || !renderer) return; running = true; last = performance.now(); warm = 0; acc = frames = 0; raf = requestAnimationFrame(frame); }
function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
function shutdown() {
  dead = true; stop(); canvas.dataset.wgl = 'off'; canvas.classList.remove('is-on');
  setTimeout(() => { try { renderer.gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (e) {} }, 1600);
}

function setPointer(cx, cy) {
  const r = canvas.getBoundingClientRect();
  mouse.x = Math.max(0, Math.min(1, (cx - r.left) / r.width));
  mouse.y = Math.max(0, Math.min(1, 1 - (cy - r.top) / r.height));
}

function init() {
  try {
    renderer = new Renderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: false, depth: false, powerPreference: 'low-power', dpr: res });
    const gl = renderer.gl;
    program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms: U, transparent: true, depthTest: false, depthWrite: false });
    mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  } catch (e) { return; }
  resize();

  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : (hero.getBoundingClientRect().bottom > 0 && start())));
  new MutationObserver(() => { tgt = readTheme(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') setPointer(e.clientX, e.clientY); }, { passive: true });
  const touch = e => { const t = e.touches[0]; if (t) { setPointer(t.clientX, t.clientY); energy = Math.min(1, energy + .25); } };
  addEventListener('touchstart', touch, { passive: true });
  addEventListener('touchmove', touch, { passive: true });

  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); canvas.classList.remove('is-on'); ready = false; }, false);
  canvas.addEventListener('webglcontextrestored', () => { try { renderer = new Renderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: false, depth: false, dpr: res }); const gl = renderer.gl; program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms: U, transparent: true }); mesh = new Mesh(gl, { geometry: new Triangle(gl), program }); resize(); start(); } catch (e) { dead = true; } }, false);

  if (!document.hidden) start();
}

if (canvas && hero) init();
