import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const curRef = useRef(null);
  const curRRef = useRef(null);
  const mouseRef = useRef({ cx: 0, cy: 0, rx: 0, ry: 0 });
  const animRef = useRef(null);
  useEffect(() => {
    // Check if device is touch-only or mobile-sized to hide custom cursor
    const isMobile = window.innerWidth <= 1024 || !window.matchMedia('(any-pointer: fine)').matches;
    if (isMobile) {
      document.body.classList.add('no-custom-cursor');
      return;
    }
    document.body.classList.remove('no-custom-cursor');

    const cur = curRef.current;
    const curR = curRRef.current;
    if (!cur || !curR) return;

    const handleMouseMove = (e) => {
      mouseRef.current.cx = e.clientX;
      mouseRef.current.cy = e.clientY;
      cur.style.left = `${e.clientX}px`;
      cur.style.top = `${e.clientY}px`;
    };

    const animR = () => {
      const { cx, cy } = mouseRef.current;
      mouseRef.current.rx += (cx - mouseRef.current.rx) * 0.11;
      mouseRef.current.ry += (cy - mouseRef.current.ry) * 0.11;
      
      curR.style.left = `${mouseRef.current.rx}px`;
      curR.style.top = `${mouseRef.current.ry}px`;
      
      animRef.current = requestAnimationFrame(animR);
    };

    // Hover state via event delegation
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      const hoverable = target.closest('a, button, .dk, .tc, .sc-hd, .tl-hd, .edu-hd, .bc, .fb, .vp, .trow, .nlb, .hover-target');
      if (hoverable) {
        document.body.classList.add('c-hover');
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (!target) return;
      const hoverable = target.closest('a, button, .dk, .tc, .sc-hd, .tl-hd, .edu-hd, .bc, .fb, .vp, .trow, .nlb, .hover-target');
      if (hoverable) {
        document.body.classList.remove('c-hover');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.add('c-click');
    };

    const handleMouseUp = () => {
      document.body.classList.remove('c-click');
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    
    animRef.current = requestAnimationFrame(animR);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('c-hover', 'c-click', 'no-custom-cursor');
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, []);

  return (
    <>
      <div id="cur" ref={curRef}></div>
      <div id="cur-r" ref={curRRef}></div>
    </>
  );
}
