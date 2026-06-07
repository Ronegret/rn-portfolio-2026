import React from 'react';
import { T } from '../data/translations';
import { AnimatedCounter } from './Hero';

export default function CountsStrip({ lang }) {
  const t = T[lang] || T.es;

  return (
    <div className="counts-strip">
      <div className="wrap">
        <div className="counts-g">
          <div className="ci rv">
            <div className="ci-n">
              <AnimatedCounter target={17} suffix="+" />
            </div>
            <div className="ci-l">{t.count1}</div>
          </div>
          <div className="ci rv" data-d="1">
            <div className="ci-n">
              <AnimatedCounter target={11} />
            </div>
            <div className="ci-l">{t.count2}</div>
          </div>
          <div className="ci rv" data-d="2">
            <div className="ci-n">
              <AnimatedCounter target={40} suffix="+" />
            </div>
            <div className="ci-l">{t.count3}</div>
          </div>
          <div className="ci rv" data-d="3">
            <div className="ci-n">
              <AnimatedCounter target={95} suffix="%" />
            </div>
            <div className="ci-l">{t.count4}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
