import React from 'react';
import { T } from '../data/translations';
import { testimonials } from '../data/testimonials';

export default function Testimonios({ lang }) {
  const t = T[lang] || T.es;

  return (
    <section className="sec" id="testimonios">
      <div className="wrap">
        <p className="eyebrow rv">{t.test_ey}</p>
        <h2 className="sh rv" dangerouslySetInnerHTML={{ __html: t.test_h }}></h2>
        
        <div className="test-g">
          {testimonials.map((item) => {
            const quote = t[item.quoteKey];
            const name = t[item.nameKey];

            return (
              <div 
                key={item.id} 
                className="test-c rv" 
                data-d={item.delay}
              >
                <div className="tstars">{item.stars}</div>
                <p className="tq">{quote}</p>
                <div className="tp">
                  <div className={`tav ${item.avatarClass}`}>
                    <span>{item.initials}</span>
                  </div>
                  <div>
                    <div className="tname">{name}</div>
                    <div className="trole">{item.role}</div>
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
