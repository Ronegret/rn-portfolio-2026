/* Cursor «Fluido»: estela de fluido WebGL discreta tras el puntero (el efecto del cursor «Fluido» de rodd.es,
   que usa SplashCursor de React Bits). Esto es un port propio y reducido del algoritmo original:

   WebGL-Fluid-Simulation — https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
   MIT License. Copyright (c) 2017 Pavel Dobryakov
   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
   documentation files (the "Software"), to deal in the Software without restriction, including without limitation
   the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
   permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright
   notice and this permission notice shall be included in all copies or substantial portions of the Software.
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
   THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
   TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

   Menos invasivo que rodd.es (SIM 128 / DYE 1024 / radio .18 / fuerza 5000): simulacion 64, tinte 256, radio ~1/3,
   disipacion mas rapida, sin bloom ni sombreado, lienzo a media resolucion con DPR<=1 y opacidad moderada.
   Mezcla screen en temas oscuros (solo aclara: el texto claro sigue claro) y multiply en claros (solo oscurece:
   el texto oscuro sigue oscuro). Colores = --a1/--a2 del tema activo, reaccionando al cambio de tema.
   main.js solo lo importa en la primera pointermove de raton en modo «fluido» (nunca en Lighthouse ni en tactil).
   El bucle se duerme con el puntero quieto (~1.4 s) o con la pestana oculta. Sin WebGL/half-float no se monta
   (queda el cursor normal del sitio). */

const C = { SIM: 64, DYE: 256, DENS: 4.2, VEL: 3, PRESSURE: .8, ITER: 10, CURL: 2, RADIUS: .055, FORCE: 3200, GAIN: .1 };
const D = document, root = D.documentElement, body = D.body;
const cv = D.createElement('canvas');
cv.setAttribute('aria-hidden', 'true');
cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99990';
const gl = cv.getContext('webgl2', { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' })
  || cv.getContext('webgl', { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
const F = {};

function setup() {
  const w2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  if (w2) {
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return false;
    F.type = gl.HALF_FLOAT; F.ifmt = gl.RGBA16F; F.fmt = gl.RGBA; // filtrado lineal de half-float: nucleo en WebGL2
  } else {
    const h = gl.getExtension('OES_texture_half_float');
    // shortcut: sin filtrado lineal no montamos el efecto (cursor normal) en vez de filtrar a mano en el shader
    if (!h || !gl.getExtension('OES_texture_half_float_linear')) return false;
    F.type = h.HALF_FLOAT_OES; F.ifmt = F.fmt = gl.RGBA;
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo(4, 4).fb);
  return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
}

/* ── GL ── */
function fbo(w, h) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
  gl.texImage2D(gl.TEXTURE_2D, 0, F.ifmt, w, h, 0, F.fmt, F.type, null);
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  return { fb, w, h, tx: 1 / w, ty: 1 / h, use(u) { gl.activeTexture(gl.TEXTURE0 + u); gl.bindTexture(gl.TEXTURE_2D, tex); return u; } };
}
function dbl(w, h) {
  const o = { r: fbo(w, h), w: fbo(w, h), swap() { [o.r, o.w] = [o.w, o.r]; } };
  return o;
}
const VS = 'precision highp float;attribute vec2 aP;varying vec2 vUv,vL,vR,vT,vB;uniform vec2 ts;void main(){vUv=aP*.5+.5;vL=vUv-vec2(ts.x,0.);vR=vUv+vec2(ts.x,0.);vT=vUv+vec2(0.,ts.y);vB=vUv-vec2(0.,ts.y);gl_Position=vec4(aP,0.,1.);}';
function prog(fs) {
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, 'precision highp float;precision highp sampler2D;varying vec2 vUv,vL,vR,vT,vB;' + fs));
  gl.bindAttribLocation(p, 0, 'aP'); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
  return { p, u };
}

let S, sim, dye, curl, div, prs, cw = 0, ch = 0;
function build() {
  S = {
    clear: prog('uniform sampler2D uT;uniform float v;void main(){gl_FragColor=v*texture2D(uT,vUv);}'),
    splat: prog('uniform sampler2D uT;uniform float ar,rad;uniform vec3 col;uniform vec2 pt;void main(){vec2 p=vUv-pt;p.x*=ar;gl_FragColor=vec4(texture2D(uT,vUv).xyz+exp(-dot(p,p)/rad)*col,1.);}'),
    adv: prog('uniform sampler2D uV,uS;uniform vec2 ts;uniform float dt,dis;void main(){vec2 c=vUv-dt*texture2D(uV,vUv).xy*ts;gl_FragColor=texture2D(uS,c)/(1.+dis*dt);}'),
    div: prog('uniform sampler2D uV;void main(){float L=texture2D(uV,vL).x,R=texture2D(uV,vR).x,T=texture2D(uV,vT).y,B=texture2D(uV,vB).y;vec2 C=texture2D(uV,vUv).xy;if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);}'),
    curl: prog('uniform sampler2D uV;void main(){gl_FragColor=vec4(.5*(texture2D(uV,vR).y-texture2D(uV,vL).y-texture2D(uV,vT).x+texture2D(uV,vB).x),0.,0.,1.);}'),
    vort: prog('uniform sampler2D uV,uC;uniform float k,dt;void main(){float L=texture2D(uC,vL).x,R=texture2D(uC,vR).x,T=texture2D(uC,vT).x,B=texture2D(uC,vB).x,C=texture2D(uC,vUv).x;vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+.0001;f*=k*C;f.y*=-1.;vec2 v=texture2D(uV,vUv).xy+f*dt;gl_FragColor=vec4(clamp(v,-1000.,1000.),0.,1.);}'),
    prs: prog('uniform sampler2D uP,uD;void main(){gl_FragColor=vec4((texture2D(uP,vL).x+texture2D(uP,vR).x+texture2D(uP,vB).x+texture2D(uP,vT).x-texture2D(uD,vUv).x)*.25,0.,0.,1.);}'),
    grad: prog('uniform sampler2D uP,uV;void main(){vec2 v=texture2D(uV,vUv).xy-vec2(texture2D(uP,vR).x-texture2D(uP,vL).x,texture2D(uP,vT).x-texture2D(uP,vB).x);gl_FragColor=vec4(v,0.,1.);}'),
    // premultiplicado: alfa = intensidad del tinte, color = tono del acento (screen lo suma, multiply lo usa de tinta)
    show: prog('uniform sampler2D uT;void main(){vec3 c=min(texture2D(uT,vUv).rgb,vec3(1.));gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}'),
  };
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(0);
  gl.disable(gl.BLEND);
}
const res = r => { const a = cw / ch, M = Math.round(r * (a < 1 ? 1 / a : a)); return a >= 1 ? [M, r] : [r, M]; };
function size() {
  const s = Math.min(devicePixelRatio || 1, 1) * .5, w = Math.max(1, Math.round(innerWidth * s)), h = Math.max(1, Math.round(innerHeight * s));
  if (w === cw && h === ch) return;
  cw = cv.width = w; ch = cv.height = h;
  const [sw, sh] = res(C.SIM), [dw, dh] = res(C.DYE);
  sim = dbl(sw, sh); dye = dbl(dw, dh); curl = fbo(sw, sh); div = fbo(sw, sh); prs = dbl(sw, sh); // al redimensionar se reinicia (la estela dura 1 s)
}
function draw(t, pr) {
  if (t) { gl.viewport(0, 0, t.w, t.h); gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb); }
  else { gl.viewport(0, 0, cw, ch); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
const use = (k, ts) => { const p = S[k]; gl.useProgram(p.p); if (ts) gl.uniform2f(p.u.ts, sim.r.tx, sim.r.ty); return p.u; };
function step(dt) {
  let u = use('curl', 1); gl.uniform1i(u.uV, sim.r.use(0)); draw(curl);
  u = use('vort', 1); gl.uniform1i(u.uV, sim.r.use(0)); gl.uniform1i(u.uC, curl.use(1)); gl.uniform1f(u.k, C.CURL); gl.uniform1f(u.dt, dt); draw(sim.w); sim.swap();
  u = use('div', 1); gl.uniform1i(u.uV, sim.r.use(0)); draw(div);
  u = use('clear'); gl.uniform1i(u.uT, prs.r.use(0)); gl.uniform1f(u.v, C.PRESSURE); draw(prs.w); prs.swap();
  u = use('prs', 1); gl.uniform1i(u.uD, div.use(0));
  for (let i = 0; i < C.ITER; i++) { gl.uniform1i(u.uP, prs.r.use(1)); draw(prs.w); prs.swap(); }
  u = use('grad', 1); gl.uniform1i(u.uP, prs.r.use(0)); gl.uniform1i(u.uV, sim.r.use(1)); draw(sim.w); sim.swap();
  u = use('adv', 1); gl.uniform1f(u.dt, dt);
  gl.uniform1i(u.uV, sim.r.use(0)); gl.uniform1i(u.uS, 0); gl.uniform1f(u.dis, C.VEL); draw(sim.w); sim.swap();
  gl.uniform1i(u.uV, sim.r.use(0)); gl.uniform1i(u.uS, dye.r.use(1)); gl.uniform1f(u.dis, C.DENS); draw(dye.w); dye.swap();
}
function splat(x, y, dx, dy, col) {
  const ar = cw / ch, u = use('splat');
  gl.uniform1f(u.ar, ar); gl.uniform2f(u.pt, x, y); gl.uniform1f(u.rad, C.RADIUS / 100 * (ar > 1 ? ar : 1));
  gl.uniform1i(u.uT, sim.r.use(0)); gl.uniform3f(u.col, dx, dy, 0); draw(sim.w); sim.swap();
  gl.uniform1i(u.uT, dye.r.use(0)); gl.uniform3fv(u.col, col); draw(dye.w); dye.swap();
}

/* ── tema: --a1/--a2 del tema activo; screen en oscuros, multiply en claros ── */
let pal = [[1, 1, 1]], light = false;
const rgb = v => { cv.style.color = v; return (getComputedStyle(cv).color.match(/[\d.]+/g) || [255, 255, 255]).slice(0, 3).map(n => n / 255); };
function theme() {
  const [r, g, b] = rgb('var(--bg)');
  light = .2126 * r + .7152 * g + .0722 * b > .5;
  // fuera los acentos que no tinen en esa mezcla: casi negro (no suma) y, en multiply, casi blanco (neutro)
  pal = [rgb('var(--a1)'), rgb('var(--a2)')].filter(c => Math.max(...c) > .15 && !(light && Math.min(...c) > .85));
  if (!pal.length) pal = [rgb('var(--a1)')];
  cv.style.mixBlendMode = light ? 'multiply' : 'screen';
  cv.style.opacity = light ? '.45' : '.6';
}

/* ── bucle: solo mientras hay movimiento reciente ── */
let raf = 0, last = 0, lastMove = 0, on = false, px = -1, py = -1, mdx = 0, mdy = 0, moved = false, hue = 0;
function frame(now) {
  raf = 0;
  if (D.hidden || !on) return;
  const dt = Math.min((now - last) / 1000, 1 / 60); last = now;
  size();
  if (moved) {
    moved = false;
    hue = (hue + dt * .8) % 2; // vaiven lento entre --a1 y --a2
    const t = hue > 1 ? 2 - hue : hue, a = pal[0], b = pal[1] || a, k = C.GAIN * (light ? 1.4 : 1);
    splat(px, py, mdx * C.FORCE, mdy * C.FORCE, [0, 1, 2].map(i => (a[i] + (b[i] - a[i]) * t) * k));
    mdx = mdy = 0;
  }
  step(dt);
  const u = use('show'); gl.uniform1i(u.uT, dye.r.use(0)); draw(null);
  if (now - lastMove < 1400) raf = requestAnimationFrame(frame);
  else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); } // en reposo: lienzo limpio y 0 GPU
}
const wake = () => { if (!raf && on && !D.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };

function start() {
  try { build(); size(); } catch (_) { return; }
  body.append(cv); // antes de theme(): getComputedStyle de un nodo suelto no resuelve var()
  theme();
  new MutationObserver(theme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  const sync = () => { on = body.dataset.cursor === 'fluido'; cv.style.display = on ? '' : 'none'; };
  new MutationObserver(sync).observe(body, { attributes: true, attributeFilter: ['data-cursor'] });
  sync();
  D.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !on) return;
    const x = e.clientX / innerWidth, y = 1 - e.clientY / innerHeight, ar = cw / ch;
    if (px >= 0) { mdx += (x - px) * (ar < 1 ? ar : 1); mdy += (y - py) / (ar > 1 ? ar : 1); }
    px = x; py = y; moved = true; lastMove = performance.now(); wake();
  }, { passive: true });
  D.addEventListener('visibilitychange', () => { if (D.hidden) { cancelAnimationFrame(raf); raf = 0; } });
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); on = false; cv.remove(); }); // sin contexto: queda el cursor normal
}

if (gl && setup()) start();
