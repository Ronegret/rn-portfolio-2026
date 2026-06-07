import React, { useEffect } from 'react';

const cvData = {
  ai: {
    title: 'Rodrigo Negrete Aros',
    headline: 'AI Product Designer | Generative AI Designer | AI Automation Specialist',
    contact: [
      'Barcelona, España',
      '+34 653 567 610',
      'rodrigo.negrete.aros@gmail.com',
      'https://rodrigonegrete.es',
      'https://linkedin.com/in/rodrigonegretearos'
    ],
    profile: 'AI Product Designer con base en UX/UI, diseño web y automatización de procesos. Diseño productos digitales que integran IA generativa, agentes conversacionales, flujos no-code y experiencias orientadas a negocio. Combino Figma, prototipado, arquitectura de información y design systems con herramientas como n8n, Make, Botpress, Vapi, OpenAI, Claude, Gemini y Google AI Studio. Aporto más de 10 años previos en gestión B2B enterprise, KPIs, retención y negociación, lo que me permite diseñar productos pensando en usuario, conversión y viabilidad de negocio.',
    skills: [
      'AI Product Design y diseño de experiencias con IA',
      'Generative AI, prompt design y prototipado funcional',
      'Agentes IA, chatbots, voice bots y automatización',
      'n8n, Make, Botpress, Vapi, webhooks y APIs REST',
      'OpenAI, Claude, Gemini, Google AI Studio y Vertex AI',
      'Figma, user flows, wireframes y design systems',
      'CRO, analytics, e-commerce y funnels de conversión',
      'Product thinking, KPIs, reporting y negocio B2B'
    ],
    experience: [
      {
        title: 'AI Product Designer y AI Automation Architect',
        meta: 'Agencia digital propia / Freelance | Barcelona | 2024 - Actualidad',
        items: [
          'Diseño de productos digitales con IA generativa, desde discovery, definición de flujos y prototipo hasta implementación web o no-code.',
          'Creación de agentes conversacionales y automatizaciones con Botpress, n8n, Make y Vapi para captación de leads, atención 24/7, reporting y operaciones.',
          'Integración práctica de OpenAI, Claude, Gemini, Google AI Studio, Suno AI, Midjourney y Adobe Firefly en interfaces, contenido y procesos de producto.',
          'Diseño de journeys, arquitectura de información, wireframes y prototipos en Figma para productos SaaS, e-commerce y servicios digitales.',
          'Operación de 9 ecosistemas web activos, validando soluciones reales en producción y ajustando UX, contenido, conversión y automatización.'
        ]
      },
      {
        title: 'Process Automation Specialist / Gestor de Cobros B2B',
        meta: 'Atento, cliente Orange Empresas | Barcelona | 2024 - Actualidad',
        items: [
          'Gestión de cartera corporativa B2B, trazabilidad de incidencias y coordinación de información operativa con equipos internos.',
          'Optimización de reporting con Excel avanzado, Google Workspace, Notion y automatizaciones de soporte para mejorar seguimiento y eficiencia.',
          'Aplicación de criterio de negocio y operaciones a procesos digitales, priorizando claridad, datos accionables y reducción de trabajo manual.'
        ]
      },
      {
        title: 'Coordinador de Operaciones Nacional',
        meta: 'Garden España | Barcelona | 2022 - 2024',
        items: [
          'Coordinación operativa nacional para red de tiendas, gestión de incidencias, logística, documentación y comunicación entre áreas.',
          'Digitalización de protocolos internos con herramientas colaborativas, mejorando seguimiento y estandarización operativa.'
        ]
      },
      {
        title: 'Senior Enterprise Account Manager',
        meta: 'Movistar / Telefónica Empresas | Chile | 2008 - 2019',
        items: [
          'Gestión de cuentas corporativas de alto valor en entorno B2B enterprise, con foco en retención, crecimiento y relación a largo plazo.',
          'Negociación de contratos, seguimiento de KPIs comerciales y coordinación con áreas técnicas, comerciales y de atención al cliente.',
          'Base sólida de negocio aplicada actualmente a producto digital: conversión, margen, retención, CAC, LTV y experiencia de cliente.'
        ]
      }
    ],
    projects: [
      {
        title: 'Invitoo - SaaS de invitaciones digitales inteligentes',
        meta: 'AI Product Design | WordPress | IA generativa | rodrigonegrete.es/Invitoo',
        items: [
          'Diseño end-to-end del producto: discovery, arquitectura de información, flujos de usuario, prototipo, testing y producción.',
          'Aplicación de IA generativa para personalización de contenido y experiencia de usuario en eventos digitales.'
        ]
      },
      {
        title: 'Dedícalo - Producto musical con IA generativa',
        meta: 'Generative AI | UX de producto | Suno AI | Contenido multimedia',
        items: [
          'Diseño de una experiencia de generación musical personalizada, simplificando tecnología compleja en un flujo claro para usuarios no técnicos.'
        ]
      },
      {
        title: 'Chatbots y agentes IA para servicios',
        meta: 'Botpress | Make | n8n | Vapi | Automatización',
        items: [
          'Prototipos de agentes conversacionales para cualificación de leads, atención inicial y automatización de respuestas frecuentes.'
        ]
      }
    ],
    education: [
      'Máster en Hiperautomatización y Agentes IA | EBIS Business Techschool | 2025 - 2026 | En curso',
      'Especialización en IA Generativa | UDIA - Universidad de IA | 2025 - 2026 | En curso',
      'Bootcamp UX/UI Design - Professional Track | Neoland Madrid | 2024',
      'Diseño Web Multimedia y Marketing Digital | CIPSA.NET Barcelona | 2020 - 2022',
      'Técnico Superior en Administración y Finanzas | DUOC UC, Chile | 2014 - 2017'
    ],
    languages: [
      'Español nativo',
      'Inglés A2',
      'Catalán A2'
    ],
    availability: [
      'Disponibilidad inmediata',
      'Barcelona',
      'Remoto, híbrido o presencial',
      'Residencia legal en España'
    ]
  },
  ux: {
    title: 'Rodrigo Negrete Aros',
    headline: 'UX/UI Designer | Web Designer | UI Designer with AI',
    contact: [
      'Barcelona, España',
      '+34 653 567 610',
      'rodrigo.negrete.aros@gmail.com',
      'https://rodrigonegrete.es',
      'https://linkedin.com/in/rodrigonegretearos'
    ],
    profile: 'UX/UI Designer y Web Designer con experiencia creando interfaces, sitios web y productos digitales orientados a conversión. Trabajo desde research, arquitectura de información, wireframes y prototipos en Figma hasta diseño visual, design systems e implementación en WordPress, Shopify, Framer, HTML y CSS. Integro IA generativa y automatización para acelerar ideación, contenido, personalización, captación de leads y procesos operativos. Mi trayectoria previa en gestión B2B enterprise me aporta criterio de negocio para diseñar experiencias útiles, medibles y viables.',
    skills: [
      'UX/UI Design, Web Design y Product Design',
      'Figma, wireframes, prototipos y design systems',
      'User flows, arquitectura de información y testing',
      'WordPress, Elementor, Shopify, Framer, HTML y CSS',
      'Diseño responsive, accesibilidad y optimización visual',
      'CRO, landing pages, e-commerce y funnels de conversión',
      'IA generativa para diseño, contenido y automatización',
      'Google Analytics, Hotjar, Notion y Google Workspace'
    ],
    experience: [
      {
        title: 'UX/UI Designer y Web Designer',
        meta: 'Agencia digital propia / Freelance | Barcelona | 2024 - Actualidad',
        items: [
          'Diseño y desarrollo de webs, landing pages, e-commerce y productos digitales para proyectos propios y clientes.',
          'Creación de wireframes, flujos de usuario, prototipos navegables y sistemas visuales en Figma para validar estructura y experiencia.',
          'Implementación de sitios en WordPress, Elementor, Shopify, Framer, HTML y CSS, cuidando responsive, jerarquía visual y conversión.',
          'Uso de IA generativa para acelerar exploración visual, contenido, assets, prototipos y personalización de experiencias digitales.',
          'Optimización de funnels y contenido para captación de leads, claridad de propuesta de valor y mejora de la experiencia de usuario.'
        ]
      },
      {
        title: 'Process Automation Specialist / Gestor de Cobros B2B',
        meta: 'Atento, cliente Orange Empresas | Barcelona | 2024 - Actualidad',
        items: [
          'Gestión de cartera corporativa B2B, seguimiento de incidencias y coordinación de información con equipos internos.',
          'Creación de flujos de trabajo y reporting con Excel avanzado, Google Workspace, Notion y automatizaciones de soporte.',
          'Experiencia operativa aplicada al diseño de interfaces más claras, trazables y orientadas a tareas reales de usuario.'
        ]
      },
      {
        title: 'Coordinador de Operaciones Nacional',
        meta: 'Garden España | Barcelona | 2022 - 2024',
        items: [
          'Coordinación operativa nacional para red de tiendas, documentación de procesos, incidencias y comunicación entre áreas.',
          'Digitalización de protocolos internos con herramientas colaborativas, mejorando trazabilidad, tiempos de respuesta y estandarización.'
        ]
      },
      {
        title: 'Senior Enterprise Account Manager',
        meta: 'Movistar / Telefónica Empresas | Chile | 2008 - 2019',
        items: [
          'Gestión de cuentas corporativas de alto valor en entorno B2B, con foco en retención, crecimiento y relación con cliente.',
          'Negociación de contratos, análisis de necesidades, seguimiento de KPIs comerciales y coordinación con áreas técnicas.',
          'Base de negocio aplicada a UX/UI: entender objetivos, usuarios, conversión, retención y comunicación de valor.'
        ]
      }
    ],
    projects: [
      {
        title: 'Te Atiendo - App móvil para hostelería',
        meta: 'UX/UI | Figma | Design System | User Flows',
        items: [
          'Prototipo de aplicación móvil para gestión de pedidos, con arquitectura de información, sistema de diseño y pruebas de usabilidad.'
        ]
      },
      {
        title: 'Invitoo - Plataforma de invitaciones digitales',
        meta: 'Web Design | WordPress | Product UX | IA generativa',
        items: [
          'Diseño end-to-end de plataforma digital, desde estructura, experiencia y diseño visual hasta implementación web y personalización de contenido.'
        ]
      },
      {
        title: 'Para Tu Mundo - E-commerce Shopify',
        meta: 'Shopify | CRO | UI Design | Google Analytics',
        items: [
          'Diseño de tienda online, optimización de flujo de compra, estructura de contenido y configuración de analítica para mejora del funnel.'
        ]
      }
    ],
    education: [
      'Bootcamp UX/UI Design - Professional Track | Neoland Madrid | 2024',
      'Diseño Web Multimedia y Marketing Digital | CIPSA.NET Barcelona | 2020 - 2022',
      'Máster en Hiperautomatización y Agentes IA | EBIS Business Techschool | 2025 - 2026 | En curso',
      'Especialización en IA Generativa | UDIA - Universidad de IA | 2025 - 2026 | En curso',
      'Técnico Superior en Administración y Finanzas | DUOC UC, Chile | 2014 - 2017'
    ],
    languages: [
      'Español nativo',
      'Inglés A2',
      'Catalán A2'
    ],
    availability: [
      'Disponibilidad inmediata',
      'Barcelona',
      'Remoto, híbrido o presencial',
      'Residencia legal en España'
    ]
  }
};

function CvPanel({ item }) {
  return (
    <div className="rn-block">
      <h3>{item.title}</h3>
      <p className="rn-meta">{item.meta}</p>
      <ul>
        {item.items.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Cv({ isOpen, variant, onClose, onChangeVariant }) {
  const panel = cvData[variant];

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow || '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousTitle = document.title;
    document.title = variant === 'ux'
      ? 'Rodrigo Negrete Aros — CV UX/UI Web + IA'
      : 'Rodrigo Negrete Aros — CV AI Product Designer';

    return () => {
      document.title = previousTitle;
    };
  }, [isOpen, variant]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="cv-overlay open" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="rn-cv-app" onClick={(event) => event.stopPropagation()}>
        <div className="rn-toolbar">
          <div className="rn-toolbar-inner">
            <div className="rn-tabs">
              <button
                type="button"
                className={`rn-tab ${variant === 'ai' ? 'active' : ''}`}
                onClick={() => onChangeVariant('ai')}
              >
                AI Product Designer
              </button>
              <button
                type="button"
                className={`rn-tab ${variant === 'ux' ? 'active' : ''}`}
                onClick={() => onChangeVariant('ux')}
              >
                UX/UI Web + IA
              </button>
            </div>

            <div className="rn-actions">
              <button type="button" className="rn-print" onClick={handlePrint}>
                Imprimir / Descargar
              </button>
              <button type="button" className="rn-close" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>

        <div className="rn-panel">
          <div className="rn-header">
            <span className="rn-label">Currículum</span>
            <h1>{panel.title}</h1>
            <p className="rn-headline">{panel.headline}</p>
            <p className="rn-contact">
              {panel.contact[0]} | {panel.contact[1]} |{' '}
              <a href={`mailto:${panel.contact[2]}`}>{panel.contact[2]}</a> |{' '}
              <a href="https://rodrigonegrete.es" target="_blank" rel="noopener noreferrer">rodrigonegrete.es</a> |{' '}
              <a href="https://linkedin.com/in/rodrigonegretearos" target="_blank" rel="noopener noreferrer">linkedin.com/in/rodrigonegretearos</a>
            </p>
          </div>

          <div className="rn-section">
            <h2>Perfil profesional</h2>
            <p>{panel.profile}</p>
          </div>

          <div className="rn-section rn-grid-2">
            <div>
              <h2>Competencias clave</h2>
              <ul className="rn-skills">
                {panel.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2>Idiomas y disponibilidad</h2>
              <p>{panel.languages.join(' | ')}</p>
              <p>{panel.availability.join(' | ')}</p>
              <p className="rn-note">Portfolio con proyectos visuales, casos de estudio y enlaces demostrables disponible en rodrigonegrete.es.</p>
            </div>
          </div>

          <div className="rn-section">
            <h2>Experiencia profesional</h2>
            {panel.experience.map((item) => (
              <CvPanel key={item.title} item={item} />
            ))}
          </div>

          <div className="rn-section">
            <h2>Proyectos destacados</h2>
            {panel.projects.map((item) => (
              <CvPanel key={item.title} item={item} />
            ))}
          </div>

          <div className="rn-section">
            <h2>Formación</h2>
            {panel.education.map((edu) => (
              <div className="rn-block" key={edu}>
                <h3>{edu.split(' | ')[0]}</h3>
                <p className="rn-meta">{edu.split(' | ').slice(1).join(' | ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
