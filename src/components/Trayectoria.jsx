import React, { useState } from 'react';
import { T } from '../data/translations';
import { experience } from '../data/experience';
import { education } from '../data/education';

export default function Trayectoria({ lang }) {
  const t = T[lang] || T.es;

  // Timeline: At most one item is open. Defaults to the first item ('exp1')
  const [openExperienceId, setOpenExperienceId] = useState('exp1');

  // Education: Multiple items can be open independently. First is open by default
  const [openEducationIds, setOpenEducationIds] = useState({
    edu1: true,
    edu2: false,
    edu3: false,
    edu4: false
  });

  const toggleExperience = (id) => {
    if (openExperienceId === id) {
      setOpenExperienceId(null); // Close it if it was already open
    } else {
      setOpenExperienceId(id); // Open the clicked one, closing others
    }
  };

  const toggleEducation = (id) => {
    setOpenEducationIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section className="sec" id="trayectoria">
      <div className="wrap">
        <span className="sec-n" aria-hidden="true">05</span>
        <p className="eyebrow rv">{t.car_ey}</p>
        <h2 className="sh rv" dangerouslySetInnerHTML={{ __html: t.car_h }}></h2>
        <p className="sb rv" dangerouslySetInnerHTML={{ __html: t.car_sub }}></p>

        {/* Professional Experience Timeline */}
        <div className="tl-list">
          {experience.map((item) => {
            const role = t[item.roleKey];
            const company = item.companyKey ? t[item.companyKey] : item.company;
            const desc = t[item.descKey];
            const isOpen = openExperienceId === item.id;

            return (
              <div 
                key={item.id} 
                className={`tl ${item.isActual ? 'curr' : ''} rv ${isOpen ? 'open' : ''}`}
                data-d={item.delay}
              >
                <div className="tl-hd" onClick={() => toggleExperience(item.id)}>
                  <div className="tl-dot"></div>
                  <div className="tl-meta">
                    <div className="tl-role">{role}</div>
                    <div className="tl-co">{company}</div>
                  </div>
                  {item.isActual && <span className="curr-pill">{t.curr}</span>}
                  <span className="tl-dates">{item.date}</span>
                  <div className="tl-chv">
                    <svg viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="tl-bd" style={{ maxHeight: isOpen ? '380px' : '0px' }}>
                  <div className="tl-bi">
                    <p className="tl-desc">{desc}</p>
                    <div className="tl-tags">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="tl-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Academic Education */}
        <p className="eyebrow rv" style={{ marginTop: '2.8rem' }}>{t.edu_ey}</p>
        <div className="edu-list">
          {education.map((item) => {
            const title = t[item.titleKey];
            const desc = t[item.descKey];
            const isOpen = openEducationIds[item.id];

            return (
              <div 
                key={item.id} 
                className={`edu rv ${isOpen ? 'open' : ''}`}
                data-d={item.delay}
              >
                <div className="edu-hd" onClick={() => toggleEducation(item.id)}>
                  {item.isActual ? (
                    <span className="edu-b edu-curr">{t.in_progress}</span>
                  ) : (
                    <span className="edu-b edu-done">{item.date}</span>
                  )}
                  <div className="edu-m">
                    <div className="edu-title">{title}</div>
                    <div className="edu-school">{item.school}</div>
                  </div>
                  <div className="edu-chv">
                    <svg viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="edu-bd" style={{ maxHeight: isOpen ? '180px' : '0px' }}>
                  <div className="edu-bi">
                    <p className="edu-desc">{desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
