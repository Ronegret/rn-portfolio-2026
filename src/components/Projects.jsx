import React, { useState } from 'react';
import { T } from '../data/translations';
import { projects } from '../data/projects';
import useTilt from '../hooks/useTilt';

// Sub-component for individual project cards to handle independent tilt hooks
function ProjectCard({ project, t }) {
  const tiltRef = useTilt();

  const triggerFlash = () => {
    document.body.classList.add('flashing');
    setTimeout(() => document.body.classList.remove('flashing'), 100);
  };

  const title = project.titleKey ? t[project.titleKey] : project.title;
  const desc = project.descKey ? t[project.descKey] : project.desc;
  const linkText = project.linkKey ? t[project.linkKey] : 'Ver proyecto →';
  const tags = project.tagKey ? [t[project.tagKey]] : project.tags || [];

  const cardContent = (
    <>
      <div 
        className="bc-img" 
        style={project.background ? { background: project.background } : {}}
      >
        <img decoding="async" src={project.image} alt={title} />
      </div>
      <div className="bc-bd">
        <div className="bc-tags">
          {project.isFeatured && <span className="bc-tag bc-tag-hi">★ Caso destacado</span>}
          {tags.map((tagLabel, index) => (
            <span key={`${project.id}-tag-${index}`} className="bc-tag">{tagLabel}</span>
          ))}
        </div>
        <h3 className="bc-h">{title}</h3>
        <p className="bc-d">{desc}</p>
        {project.metric && <div className="bc-m">{project.metric}</div>}
        <span className="bc-link">{linkText}</span>
      </div>
    </>
  );

  const isExternal = project.path?.endsWith('.html') || project.path?.startsWith('http');

  return (
    <div 
      ref={tiltRef}
      className={`${project.isFeatured ? 'bfeat' : ''} rv`}
      data-d={project.delay}
    >
      <a 
        href={project.path} 
        onClick={triggerFlash}
        className="bc trigger-flash"
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        aria-label={`Abrir proyecto ${title}`}
      >
        {cardContent}
      </a>
    </div>
  );
}

export default function Projects({ lang }) {
  const t = T[lang] || T.es;
  const [activeFilter, setActiveFilter] = useState('all');

  const filterOptions = [
    { key: 'all', labelKey: 'f_all' },
    { key: 'ux', labelKey: 'f_ux' },
    { key: 'ia', labelKey: 'f_ia' },
    { key: 'ecom', labelKey: 'f_ecom' },
    { key: 'saas', labelKey: 'f_saas' }
  ];

  // Filter projects by category
  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.cats.split(' ').includes(activeFilter));

  return (
    <section className="sec" id="proyectos">
      <div className="wrap">
        <span className="sec-n" aria-hidden="true">03</span>
        <p className="eyebrow rv">{t.proj_ey}</p>
        <h2 className="sh rv" dangerouslySetInnerHTML={{ __html: t.proj_h }}></h2>
        <p className="sb rv" dangerouslySetInnerHTML={{ __html: t.proj_sub }}></p>
        
        {/* Filter Bar */}
        <div className="fbar rv">
          {filterOptions.map((opt) => (
            <button 
              key={opt.key}
              className={`fb ${activeFilter === opt.key ? 'on' : ''}`}
              onClick={() => setActiveFilter(opt.key)}
            >
              {t[opt.labelKey]}
            </button>
          ))}
        </div>

        {/* Bento Grid */}
        <div className="bento">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              t={t} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
