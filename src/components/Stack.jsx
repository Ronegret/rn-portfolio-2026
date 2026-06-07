import React, { useState } from 'react';
import { T } from '../data/translations';
import { skills } from '../data/skills';

export default function Stack({ lang }) {
  const t = T[lang] || T.es;

  // State to manage accordion open/close states
  const [openAccordions, setOpenAccordions] = useState({
    ia: false,
    design: false,
    cro: false
  });

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <section className="sec" id="stack">
      <div className="wrap">
        <span className="sec-n" aria-hidden="true">02</span>
        <p className="eyebrow rv">{t.stack_ey}</p>
        <h2 className="sh rv" dangerouslySetInnerHTML={{ __html: t.stack_h }}></h2>
        <p className="sb rv" dangerouslySetInnerHTML={{ __html: t.stack_sub }}></p>
        
        {/* Endless Marquee of Tools */}
        <div className="mq rv">
          <div className="mq-i" id="mq-i">
            {/* Render two copies of the list for infinite seamless loop */}
            {[...skills, ...skills].map((tool, idx) => (
              <span key={idx} className={`mpill ${tool.className}`}>
                {tool.name}
              </span>
            ))}
          </div>
        </div>
        
        {/* Accordions */}
        <div className="sg">
          {/* 1. IA & Automatización */}
          <div className={`sc ${openAccordions.ia ? 'open' : ''}`}>
            <div className="sc-hd" onClick={() => toggleAccordion('ia')}>
              <span className="sc-ic">⚡</span>
              <span className="sc-ttl">{t.scat1}</span>
              <span className="sc-ct">15+ tools</span>
              <div className="sc-chv">
                <svg viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="sc-bd" style={{ maxHeight: openAccordions.ia ? '800px' : '0px' }}>
              <div className="trow"><span className="tn">Make (Integromat)</span><span className="tlv lv-e">Expert</span></div>
              <div className="trow"><span className="tn">n8n</span><span className="tlv lv-e">Expert</span></div>
              <div className="trow"><span className="tn">Botpress</span><span className="tlv lv-e">Expert</span></div>
              <div className="trow"><span className="tn">OpenAI / ChatGPT-4o</span><span className="tlv lv-e">Expert</span></div>
              <div className="trow"><span className="tn">Claude 3.5</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Vapi (Voice AI)</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Gemini AI</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Google AI Studio</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Google Flow / Vertex</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Nano Banana</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Claude Code</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Open Claw</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">ElevenLabs</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Midjourney / Firefly</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">UiPath</span><span className="tlv lv-w">Working</span></div>
            </div>
          </div>

          {/* 2. Design & Frontend */}
          <div className={`sc ${openAccordions.design ? 'open' : ''}`}>
            <div className="sc-hd" onClick={() => toggleAccordion('design')}>
              <span className="sc-ic">🎨</span>
              <span className="sc-ttl">{t.scat2}</span>
              <span className="sc-ct">14+ tools</span>
              <div className="sc-chv">
                <svg viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="sc-bd" style={{ maxHeight: openAccordions.design ? '800px' : '0px' }}>
              <div className="trow"><span className="tn">Figma</span><span className="tlv lv-e">Expert</span></div>
              <div className="trow"><span className="tn">HTML5 / CSS3 / JS</span><span className="tlv lv-e">Expert</span></div>
              <div className="trow"><span className="tn">WordPress</span><span className="tlv lv-e">Expert</span></div>
              <div className="trow"><span className="tn">Tailwind CSS</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">React</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Node.js / Firebase</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Framer</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Shopify / Liquid</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Whisk</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Stitch</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Pomelli</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Mixboard</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">GitHub Copilot</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Angular / Vue</span><span className="tlv lv-w">Working</span></div>
            </div>
          </div>

          {/* 3. CRO & Operations */}
          <div className={`sc ${openAccordions.cro ? 'open' : ''}`}>
            <div className="sc-hd" onClick={() => toggleAccordion('cro')}>
              <span className="sc-ic">📊</span>
              <span className="sc-ttl">{t.scat3}</span>
              <span className="sc-ct">7 tools</span>
              <div className="sc-chv">
                <svg viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="sc-bd" style={{ maxHeight: openAccordions.cro ? '800px' : '0px' }}>
              <div className="trow"><span className="tn">Google Analytics 4</span><span className="tlv lv-e">Expert</span></div>
              <div className="trow"><span className="tn">Excel Avanzado / Power BI</span><span className="tlv lv-e">Expert</span></div>
              <div className="trow"><span className="tn">Hotjar / FullStory</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Google Workspace</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Notion / Linear / Jira</span><span className="tlv lv-a">Advanced</span></div>
              <div className="trow"><span className="tn">Salesforce / HubSpot</span><span className="tlv lv-w">Working</span></div>
              <div className="trow"><span className="tn">Trello</span><span className="tlv lv-w">Working</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
