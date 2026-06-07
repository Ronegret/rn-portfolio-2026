import React from 'react';
import { T } from '../data/translations';

export default function Testimonios({ lang }) {
  const t = T[lang] || T.es;

  return (
    <section className="sec" id="testimonios">
      <div className="wrap">
        <p className="eyebrow rv">{t.test_ey}</p>
        <h2 className="sh rv" dangerouslySetInnerHTML={{ __html: t.test_h }}></h2>
        <p className="sb rv">{t.test_sub}</p>

        <div className="test-cta-row rv" style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <a
            href="mailto:rodrigo.negrete.aros@gmail.com?subject=Testimonio%20para%20portfolio"
            className="btn-s"
          >
            ✉ {t.test_btn1}
          </a>
          <a
            href="https://linkedin.com/in/rodrigonegretearos"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-s"
          >
            🔗 {t.test_btn2}
          </a>
        </div>

        <div className="test-g">
          {[
            { n: '01', titleKey: 'test_s1_n', descKey: 'test_s1_d' },
            { n: '02', titleKey: 'test_s2_n', descKey: 'test_s2_d' },
            { n: '03', titleKey: 'test_s3_n', descKey: 'test_s3_d' }
          ].map((step) => (
            <div key={step.n} className="test-c rv">
              <div className="tstars" style={{ fontSize: '1.4rem', fontFamily: 'var(--fm)', color: 'var(--a1)', marginBottom: '0.75rem' }}>{step.n}</div>
              <p className="tq" style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{t[step.titleKey]}</p>
              <p style={{ color: 'var(--t2)', fontSize: '0.9rem', lineHeight: 1.6 }}>{t[step.descKey]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
