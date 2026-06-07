import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';

export default function InteractiveBackground({ theme }) {
  const bgCanvasRef = useRef(null);
  const lrCanvasRef = useRef(null);
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mousePosRef.current = {
        x: e.clientX / w,
        y: e.clientY / h
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 1. WebGL (Light Rays via OGL) - active only for 'saas' theme
  useEffect(() => {
    const canvas = lrCanvasRef.current;
    if (!canvas) return;

    let renderer, mesh, uniforms, animId;

    const hexToRgb = (hex) => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
    };

    const vert = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const frag = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec2 rayPos;
      uniform vec2 rayDir;
      uniform vec3 raysColor;
      uniform float raysSpeed;
      uniform float lightSpread;
      uniform float rayLength;
      uniform float fadeDistance;
      uniform vec2 mousePos;
      uniform float mouseInfluence;
      uniform float distortion;
      varying vec2 vUv;

      float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
        vec2 s2c = coord - raySource;
        vec2 dn = normalize(s2c);
        float cosA = dot(dn, rayRefDirection);
        float da = cosA + distortion * sin(iTime * 2.0 + length(s2c) * 0.01) * 0.2;
        float sf = pow(max(da, 0.0), 1.0 / max(lightSpread, 0.001));
        float dist = length(s2c);
        float maxDist = iResolution.x * rayLength;
        float lf = clamp((maxDist - dist) / maxDist, 0.0, 1.0);
        float ff = clamp((iResolution.x * fadeDistance - dist) / (iResolution.x * fadeDistance), 0.5, 1.0);
        float bs = clamp((0.45 + 0.15 * sin(da * seedA + iTime * speed)) + (0.3 + 0.2 * cos(-da * seedB + iTime * speed)), 0.0, 1.0);
        return bs * lf * ff * sf;
      }

      void main() {
        vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);
        vec2 frd = rayDir;
        if (mouseInfluence > 0.0) {
          vec2 msp = mousePos * iResolution.xy;
          vec2 md = normalize(msp - rayPos);
          frd = normalize(mix(rayDir, md, mouseInfluence));
        }
        vec4 r1 = vec4(1.0) * rayStrength(rayPos, frd, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
        vec4 r2 = vec4(1.0) * rayStrength(rayPos, frd, coord, 22.3991, 18.0234, 1.1 * raysSpeed);
        vec4 fc = r1 * 0.5 + r2 * 0.4;
        float br = 1.0 - (coord.y / iResolution.y);
        fc.x *= 0.1 + br * 0.8;
        fc.y *= 0.3 + br * 0.6;
        fc.z *= 0.5 + br * 0.5;
        fc.rgb *= raysColor;
        gl_FragColor = fc;
      }
    `;

    const setup = () => {
      try {
        renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
        const gl = renderer.gl;
        uniforms = {
          iTime: { value: 0 },
          iResolution: { value: [1, 1] },
          rayPos: { value: [0, 0] },
          rayDir: { value: [0, 1] },
          raysColor: { value: hexToRgb('#00d4d4') },
          raysSpeed: { value: 1.4 },
          lightSpread: { value: 0.65 },
          rayLength: { value: 1.5 },
          fadeDistance: { value: 1.0 },
          mousePos: { value: [0.5, 0.5] },
          mouseInfluence: { value: 0.12 },
          distortion: { value: 0.04 }
        };
        const geometry = new Triangle(gl);
        const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
        mesh = new Mesh(gl, { geometry, program });
        resize();
      } catch (e) {
        console.error('WebGL Setup failed:', e);
      }
    };

    const resize = () => {
      if (!renderer || !canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h);
      const dpr = renderer.dpr;
      uniforms.iResolution.value = [w * dpr, h * dpr];
      uniforms.rayPos.value = [w * dpr * 0.5, -h * dpr * 0.18];
      uniforms.rayDir.value = [0, 1];
    };

    const loop = (t) => {
      if (!renderer || !mesh || !uniforms) {
        animId = requestAnimationFrame(loop);
        return;
      }
      uniforms.iTime.value = t * 0.001;
      
      // Smooth mouse
      smoothMouseRef.current.x = smoothMouseRef.current.x * 0.92 + mousePosRef.current.x * 0.08;
      smoothMouseRef.current.y = smoothMouseRef.current.y * 0.92 + mousePosRef.current.y * 0.08;
      uniforms.mousePos.value = [smoothMouseRef.current.x, smoothMouseRef.current.y];

      // Sync color
      if (theme === 'saas') {
        uniforms.raysColor.value = hexToRgb('#00d4d4');
      }

      try {
        renderer.render({ scene: mesh });
      } catch (e) {}
      animId = requestAnimationFrame(loop);
    };

    const show = () => {
      canvas.style.opacity = '0.4';
      if (!renderer) setup();
      if (!animId) animId = requestAnimationFrame(loop);
    };

    const hide = () => {
      canvas.style.opacity = '0';
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    window.addEventListener('resize', resize, { passive: true });

    if (theme === 'saas') {
      show();
    } else {
      hide();
    }

    const handleVisibilityChange = () => {
      if (document.hidden && animId) {
        cancelAnimationFrame(animId);
        animId = null;
      } else if (!document.hidden && theme === 'saas') {
        animId = requestAnimationFrame(loop);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, [theme]);

  // 2. 2D Background Animation Canvas (#bg-cv)
  useEffect(() => {
    const cv = bgCanvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let W, H;
    let rays = [];
    let cyberParticles = [];
    let rafId;

    const resize2d = () => {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
      init2dAll();
    };

    const initSaas = () => {
      rays = [];
      for (let i = 0; i < 16; i++) {
        rays.push({
          a: -Math.PI / 2 + (i / 15 - 0.5) * Math.PI * 0.7,
          w: 90 + Math.random() * 200,
          al: 0.015 + Math.random() * 0.022,
          sp: 0.00016 + Math.random() * 0.0002,
          ph: Math.random() * Math.PI * 2,
          wb: (Math.random() - 0.5) * 0.012,
          len: 0.5 + Math.random() * 0.48,
          c: Math.random() > 0.5 ? '0,212,212' : '255,51,51'
        });
      }
    };

    const drawSaas = (t, mx, my) => {
      const ox = W * (0.22 + mx * 0.55);
      const oy = H * (-0.07 + my * 0.04);
      rays.forEach((r) => {
        const a = r.a + Math.sin(t * r.sp * 3000 + r.ph) * r.wb + (mx - 0.5) * 0.11;
        const p = 0.5 + 0.5 * Math.sin(t * r.sp * 4100 + r.ph * 1.5);
        const al = r.al * p;
        const ex = ox + Math.cos(a) * W * r.len;
        const ey = oy + Math.sin(a) * H * r.len * 1.35;
        const g = ctx.createLinearGradient(ox, oy, ex, ey);
        g.addColorStop(0, `rgba(${r.c},${(al * 2).toFixed(3)})`);
        g.addColorStop(0.3, `rgba(${r.c},${(al * 0.65).toFixed(3)})`);
        g.addColorStop(0.75, `rgba(${r.c},${(al * 0.15).toFixed(3)})`);
        g.addColorStop(1, `rgba(${r.c},0)`);
        const hw = (r.w * (0.28 + 0.72 * p)) / 2;
        const px = Math.cos(a + Math.PI / 2);
        const py = Math.sin(a + Math.PI / 2);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.moveTo(ox + px * 1.2, oy + py * 1.2);
        ctx.lineTo(ex + px * hw, ey + py * hw);
        ctx.lineTo(ex - px * hw, ey - py * hw);
        ctx.closePath();
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
      });
    };

    const initCyber = () => {
      cyberParticles = [];
    };

    const drawCyber = (t) => {
      if (Math.random() < 0.016) {
        cyberParticles.push({
          ax: Math.random() > 0.5 ? 'h' : 'v',
          tr: Math.floor(Math.random() * (Math.max(W, H) / 80)) * 80,
          pos: 0,
          sp: 2.4 + Math.random() * 2.4,
          len: 55 + Math.random() * 100,
          c: Math.random() > 0.55 ? '0,240,255' : '176,38,255'
        });
      }

      cyberParticles = cyberParticles.filter((p) => {
        p.pos += p.sp;
        const maxLimit = p.ax === 'h' ? W : H;
        if (p.pos - p.len > maxLimit) return false;

        const g = p.ax === 'h'
          ? ctx.createLinearGradient(p.pos - p.len, 0, p.pos + p.len, 0)
          : ctx.createLinearGradient(0, p.pos - p.len, 0, p.pos + p.len);

        g.addColorStop(0, `rgba(${p.c},0)`);
        g.addColorStop(0.45, `rgba(${p.c},0.82)`);
        g.addColorStop(0.55, `rgba(${p.c},0.82)`);
        g.addColorStop(1, `rgba(${p.c},0)`);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = g;
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (p.ax === 'h') {
          ctx.moveTo(Math.max(0, p.pos - p.len), p.tr);
          ctx.lineTo(Math.min(W, p.pos + p.len), p.tr);
        } else {
          ctx.moveTo(p.tr, Math.max(0, p.pos - p.len));
          ctx.lineTo(p.tr, Math.min(H, p.pos + p.len));
        }
        ctx.stroke();

        const cx2 = p.ax === 'h' ? p.pos : p.tr;
        const cy2 = p.ax === 'h' ? p.tr : p.pos;
        const gw = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 15);
        gw.addColorStop(0, `rgba(${p.c},0.95)`);
        gw.addColorStop(1, `rgba(${p.c},0)`);

        ctx.fillStyle = gw;
        ctx.beginPath();
        ctx.arc(cx2, cy2, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return true;
      });
    };

    const init2dAll = () => {
      initSaas();
      initCyber();
    };

    window.addEventListener('resize', resize2d, { passive: true });
    resize2d();

    const OPACITIES = { saas: 0.55, editorial: 0.88, cyber: 1, diario: 0.88, hud: 0.75 };

    const draw = (timestamp) => {
      const elapsedSeconds = timestamp * 0.001;
      cv.style.opacity = OPACITIES[theme] || 0.82;
      ctx.clearRect(0, 0, W, H);

      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;

      if (theme === 'saas') {
        drawSaas(elapsedSeconds, mx, my);
      } else if (theme === 'cyber') {
        drawCyber(elapsedSeconds);
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(draw);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', resize2d);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(rafId);
    };
  }, [theme]);

  return (
    <>
      <canvas id="bg-cv" ref={bgCanvasRef}></canvas>
      <canvas id="lr-canvas" ref={lrCanvasRef}></canvas>
    </>
  );
}
