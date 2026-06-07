import React, { useState, useEffect } from 'react';
import CustomCursor from './components/CustomCursor';
import InteractiveBackground from './components/InteractiveBackground';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import Dock from './components/Dock';
import Hero from './components/Hero';
import CountsStrip from './components/CountsStrip';
import About from './components/About';
import Stack from './components/Stack';
import Projects from './components/Projects';
import Lab from './components/Lab';
import Trayectoria from './components/Trayectoria';
import Testimonios from './components/Testimonios';
import Estilos from './components/Estilos';
import Contacto from './components/Contacto';
import Cv from './components/Cv';
import Footer from './components/Footer';

export default function App() {
  const [lang, setLang] = useState(() => sessionStorage.getItem('rn-lang') || 'es');
  const [theme, setTheme] = useState(() => sessionStorage.getItem('rn-theme') || 'saas');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isCvOpen, setIsCvOpen] = useState(false);
  const [cvVariant, setCvVariant] = useState('ai');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    sessionStorage.setItem('rn-theme', theme);
  }, [theme]);

  // Apply language to document element
  useEffect(() => {
    document.documentElement.lang = lang;
    sessionStorage.setItem('rn-lang', lang);
  }, [lang]);

  // Highlight active link in navigation on scroll
  useEffect(() => {
    const sections = ['sobre-mi', 'stack', 'proyectos', 'laboratorio', 'trayectoria', 'contacto'];
    const observers = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.3 }
      );

      observer.observe(el);
      observers.push({ observer, el });
    });

    return () => {
      observers.forEach(({ observer, el }) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  // Handle scroll progress, compact header, and floating CTA
  useEffect(() => {
    const handleScroll = () => {
      const s = document.documentElement;
      const scrollTop = s.scrollTop || document.body.scrollTop;
      const scrollHeight = s.scrollHeight;
      const clientHeight = s.clientHeight;
      const pct = (scrollTop / (scrollHeight - clientHeight)) * 100;

      const prog = document.getElementById('prog');
      const nav = document.getElementById('nav');
      const fcta = document.getElementById('fcta');

      if (prog) prog.style.width = `${Math.min(pct, 100)}%`;
      if (nav) nav.classList.toggle('compact', window.scrollY > 80);
      if (fcta) {
        fcta.classList.toggle(
          'show',
          window.scrollY > window.innerHeight * 0.35 && pct < 96
        );
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once initially
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle scroll reveal animations (.rv, .rv-l, .rv-s, .eyebrow)
  useEffect(() => {
    const rvIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vis');
            rvIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.055, rootMargin: '0px 0px -18px 0px' }
    );

    // Observe all scroll reveal items
    const elements = document.querySelectorAll('.rv, .rv-l, .rv-s, .eyebrow');
    elements.forEach((el) => rvIO.observe(el));

    return () => {
      elements.forEach((el) => rvIO.unobserve(el));
    };
  }, [lang, theme]); // Re-observe if elements re-render on language or theme change

  const triggerFlash = () => {
    document.body.classList.add('flashing');
    setTimeout(() => document.body.classList.remove('flashing'), 100);
  };

  const handleFctaClick = (e) => {
    e.preventDefault();
    triggerFlash();
    const element = document.getElementById('contacto');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <CustomCursor />
      <div id="prog"></div>
      <div id="camera-flash"></div>
      
      <InteractiveBackground theme={theme} />
      
      <Dock theme={theme} setTheme={setTheme} />
      
      {/* Floating CTA */}
      <a 
        href="#contacto" 
        id="fcta" 
        onClick={handleFctaClick}
        className="trigger-flash"
      >
        ✉ Hablemos
      </a>
      
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        activeSection={activeSection} 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
        isMenuOpen={isMenuOpen}
      />
      
      <MobileMenu 
        lang={lang} 
        setLang={setLang} 
        theme={theme} 
        setTheme={setTheme} 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
      />
      
      <main id="content">
        <Hero lang={lang} theme={theme} onOpenCv={(variant = 'ai') => { setCvVariant(variant); setIsCvOpen(true); }} />
        <CountsStrip lang={lang} />
        <About lang={lang} />
        <Stack lang={lang} />
        <Projects lang={lang} />
        <Lab lang={lang} />
        <Trayectoria lang={lang} />
        <Testimonios lang={lang} />
        <Estilos lang={lang} theme={theme} setTheme={setTheme} />
        <Contacto lang={lang} onOpenCv={(variant = 'ai') => { setCvVariant(variant); setIsCvOpen(true); }} />
      </main>

      <Cv
        isOpen={isCvOpen}
        variant={cvVariant}
        onClose={() => setIsCvOpen(false)}
        onChangeVariant={(variant) => setCvVariant(variant)}
      />

      <Footer lang={lang} setLang={setLang} />
    </>
  );
}
