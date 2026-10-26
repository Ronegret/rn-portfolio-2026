// Fuente única del CV (ES/EN). Todo dato sale de los CV PDF de Rodrigo, de su portfolio
// o de los certificados en public/assets/legacy. Si algo cambia, edita aquí y ejecuta:
//   node scripts/build-cv.mjs   (HTML)   y   node scripts/cv-pdf.mjs   (PDF, requiere playwright)
const base = {
  name: 'Rodrigo Negrete Aros',
  email: 'rodrigo.negrete.aros@gmail.com',
  phone: '+34 653 567 610',
  site: 'rodrigonegrete.es',
  linkedin: 'linkedin.com/in/rodrigonegretearos',
  github: 'github.com/Ronegret',
};

export const cv = {
  es: {
    ...base,
    lang: 'es',
    file: 'Rodrigo-Negrete-AI-Product-Designer-CV-ES.pdf',
    headline: 'Product Designer UX/UI | AI Product Designer',
    tagline: 'Figma · Design Systems · IA generativa · Automatización · CRO',
    location: 'Barcelona, España',
    availability: 'Incorporación inmediata · Barcelona, remoto UE o híbrido · Nacionalidad española',
    targetRoles: 'Disponible para roles de AI Product Designer, Product Designer, UX/UI Designer, AI Automation Specialist o Design Technologist.',
    h: { summary: 'Resumen profesional', experience: 'Experiencia profesional', projects: 'Proyectos', skills: 'Habilidades', education: 'Educación', languages: 'Idiomas' },
    summary:
      'Product Designer UX/UI y AI Product Designer en Barcelona. Diseño y lanzo productos digitales de extremo a extremo (discovery, user research, arquitectura de información, prototipos en Figma, UI responsive y design systems) e integro IA generativa, agentes conversacionales y automatizaciones con OpenAI, Claude, Gemini, Botpress, Make, n8n y Vapi. Máster en Agentes de IA e Hiperautomatización de Procesos (EBIS Business Techschool) y más de 17 años de trayectoria en negocio B2B y operaciones, incluida la gestión de más de 100 cuentas corporativas: diseño con foco en usuario, viabilidad, conversión y eficiencia.',
    stats: [
      { n: '17+', l: 'años de trayectoria en negocio B2B y operaciones' },
      { n: '100+', l: 'cuentas corporativas gestionadas en Atento Chile (servicio a Movistar Empresas)' },
      { n: '27', l: 'nodos en el workflow n8n del TFM Just Enjoy (trabajo en equipo)' },
      { n: '287', l: 'recursos web open source en 7 idiomas (Rodd.es)' },
    ],
    experience: [
      {
        role: 'Product Designer UX/UI | IA aplicada y automatización',
        org: 'Rodrigo Negrete · Profesional independiente',
        place: 'Barcelona / remoto',
        dates: '2024 – actualidad',
        current: true,
        bullets: [
          'Diseño y lanzo productos digitales desde research, benchmark y definición de flujos hasta prototipos en Figma, interfaces responsive, automatizaciones y publicación web.',
          'Integro OpenAI, Claude, Gemini, Botpress, Make, n8n y Vapi para personalización, atención inicial, automatización operativa y experimentación de producto.',
          'Trabajo con HTML, CSS, JavaScript, React, WordPress y Shopify para validar viabilidad con desarrollo, lanzar MVP y aprender de productos reales.',
        ],
      },
      {
        role: 'Gestor de Cobros B2B | Orange Empresas',
        org: 'Abai Group (antes Atento España; vía Adecco, ETT) · cliente Orange Empresas',
        place: 'Barcelona',
        dates: 'ago. 2024 – actualidad',
        current: true,
        bullets: [
          'Gestiono información sensible, cartera corporativa, incidencias y acuerdos de pago con trazabilidad, priorización por impacto y coordinación entre equipos.',
          'Uso Excel avanzado, Microsoft Copilot y herramientas internas con HTML/JavaScript para mejorar reporting, visibilidad y eficiencia operativa.',
        ],
      },
      {
        role: 'Coordinador de Operaciones y Experiencia de Cliente',
        org: 'Garden España',
        place: 'Barcelona',
        dates: 'sept. 2022 – ago. 2024',
        bullets: [
          'Coordiné equipo, incidencias y procesos; identifiqué fricciones y digitalicé protocolos para mejorar trazabilidad, tiempo de respuesta y experiencia de servicio.',
        ],
      },
      {
        role: 'Founder E-commerce | UX/UI & Web Designer',
        org: 'ParaTuMundo',
        place: 'Barcelona',
        dates: 'ene. 2022 – dic. 2023',
        bullets: [
          'Fundé y gestioné un e-commerce en Shopify: investigación de mercado, propuesta de valor, arquitectura, catálogo, páginas de producto, contenido, SEO, analítica y optimización de conversión (CRO).',
        ],
      },
      {
        role: 'Analista de Facturación',
        org: 'Atento Chile (servicio para Movistar Empresas)',
        place: 'Chile',
        dates: 'ago. 2016 – oct. 2019',
        bullets: [
          'Gestioné el ciclo completo de facturación: revisión y análisis de facturas para detectar errores y garantizar la precisión de la información facturada.',
          'Implementé controles de calidad que mejoraron la exactitud de reportes y procesos internos.',
        ],
      },
      {
        role: 'Account Manager / Asesor Comercial',
        org: 'Atento Chile (servicio para Movistar Empresas)',
        place: 'Chile',
        dates: 'oct. 2008 – ago. 2016',
        bullets: [
          'Gestioné una cartera de más de 100 cuentas corporativas: atención personalizada, seguimiento de necesidades, negociación de contratos, cierre de acuerdos y fidelización de cuentas estratégicas en telecomunicaciones. Base directa para diseñar producto con mirada de negocio.',
        ],
      },
    ],
    projects: [
      { name: 'ZODI · AI Product, PWA, freemium', url: 'rodrigonegrete.es/zodi/', text: 'Producto de astrología, tarot, numerología y comunidad con chat conversacional personalizado por IA. 17 tipos de lectura, 4 tonos de respuesta, planes premium. Botpress, Make y OpenAI.' },
      { name: 'Just Enjoy · TFM en equipo del máster, calificación 10/10', url: 'rodrigonegrete.es/just-enjoy/', text: 'Trabajo en equipo (3 integrantes): plataforma de hiperautomatización de viajes con agentes de IA (workflow de n8n con 27 nodos, GPT-4.1 y Next.js). Mi parte: frontend, diseño UX/UI e interfaces y parte de la automatización en n8n.' },
      { name: 'Iberdata · business case final del máster, proyecto individual, examen 10/10', url: 'rodrigonegrete.es/iberdata/', text: 'Centro de Excelencia de IA para una empresa de 450 empleados: gobierno, arquitectura RAG, 2 pilotos, plan de 12 semanas, KPIs y matriz de riesgos.' },
      { name: 'Events Planner · PWA para wedding planners', url: 'rodrigonegrete.es/aem/', text: 'Aplicación web sin conexión para un estudio de bodas: portal de la pareja, plano de mesas, contrato imprimible; 15 pruebas de base de datos (pgTAP).' },
      { name: 'Dedícalo Play · juego multijugador en tiempo real', url: 'rodrigonegrete.es/dedicalo-play/', text: 'Party game musical para navegador con React y Supabase: mecánicas, UX/UI y lanzamiento. 3 modos de juego.' },
      { name: 'Invitoo · wedding tech con IA (founder)', url: 'rodrigonegrete.es/invitoo/', text: 'Invitaciones digitales con RSVP, canciones generadas con IA (Suno) y automatizaciones con Make; UX/UI y publicación web.' },
      { name: 'Rodd.es · biblioteca open source multilingüe', url: 'rodd.es', text: '287 recursos web (efectos, componentes React, escenas 3D) con vista previa en vivo y 7 idiomas.' },
      { visualOnly: true, name: 'PDF Rodd · herramienta web', url: 'rodrigonegrete.es/pdf-rodd/', text: 'Edita, firma, resalta, corrige y comprime PDFs con procesamiento local (PDF.js, PDF-lib, Fabric.js).' },
      { name: 'Te Atiendo · UX research y service design', url: 'rodrigonegrete.es/te-atiendo/', text: 'Servicio en restaurantes: 20 encuestas y entrevistas (el 90 % valora puntuar el servicio), benchmark, DAFO, journey map y prototipo en Figma.' },
      { visualOnly: true, name: 'ParaTuMundo · e-commerce y research', url: 'rodrigonegrete.es/paratumundo/', text: '33 encuestas y entrevistas, 3 competidores auditados, personas, journey map, arquitectura de información y prototipo en Figma.' },
    ],
    skills: [
      { cat: 'Diseño de producto y research', items: ['Product discovery', 'problem framing', 'user research', 'entrevistas y encuestas', 'benchmark', 'DAFO', 'personas', 'customer journey', 'service design', 'arquitectura de información', 'user flows', 'wireframes', 'prototipos de baja y alta fidelidad', 'usability testing', 'Design Thinking', 'Design Sprint', 'Lean UX', 'Agile/Scrum'] },
      { cat: 'UI y design systems', items: ['Figma', 'FigJam', 'auto layout', 'componentes y variantes', 'design systems', 'design tokens', 'responsive y mobile-first', 'accesibilidad (principios WCAG)', 'microinteracciones', 'UX writing', 'documentación y handoff a desarrollo'] },
      { cat: 'IA y automatización', items: ['IA generativa', 'prompt engineering', 'OpenAI', 'Claude', 'Gemini', 'Google AI Studio', 'Stitch', 'agentes conversacionales', 'Botpress', 'Vapi', 'Make', 'n8n', 'hiperautomatización', 'APIs y webhooks', 'RAG (diseño de arquitectura)'] },
      { cat: 'Front-end y CMS', items: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Tailwind CSS', 'WordPress', 'Elementor', 'Shopify', 'Supabase', 'Firebase', 'GitHub'] },
      { cat: 'Analítica y negocio', items: ['GA4', 'Hotjar', 'CRO', 'funnels', 'KPIs', 'Excel avanzado', 'Power BI', 'Google Workspace', 'Notion', 'Jira', 'B2B enterprise', 'e-commerce', 'MVP', 'gestión de stakeholders'] },
    ],
    education: [
      { title: 'Máster en Agentes de IA e Hiperautomatización de Procesos', school: 'EBIS Business Techschool, Barcelona', dates: 'nov. 2025 – ago. 2026 (finalizado)', cert: '/assets/legacy/Certificado%20EBIS%20IA.pdf' },
      { title: 'Especialización en IA Generativa', school: 'UDIA', dates: '2025 – 2026 (en curso)' },
      { title: 'Bootcamp UX/UI Design, 300 horas', school: 'Neoland, Madrid', dates: 'ene. – mar. 2024', cert: '/assets/legacy/Neoland.pdf' },
      { title: 'Diseño Web Multimedia y Marketing Digital', school: 'CIPSA.NET, Barcelona', dates: '2020 – 2022' },
      { title: 'Técnico en Administración Financiera', school: 'Duoc UC, Santiago de Chile', dates: '2014 – 2016', cert: '/assets/legacy/Duoc.pdf' },
    ],
    languages: [
      { l: 'Español', level: 'nativo' },
      { l: 'Inglés', level: 'A2 (elemental)' },
      { l: 'Catalán', level: 'A2 (elemental)' },
    ],
    ui: { certLabel: 'Certificado (PDF)' },
  },

  en: {
    ...base,
    lang: 'en',
    file: 'Rodrigo-Negrete-AI-Product-Designer-CV-EN.pdf',
    headline: 'Product Designer UX/UI | AI Product Designer',
    tagline: 'Figma · Design Systems · Generative AI · Automation · CRO',
    location: 'Barcelona, Spain',
    availability: 'Available immediately · Barcelona, remote EU or hybrid · Spanish national',
    targetRoles: 'Open to AI Product Designer, Product Designer, UX/UI Designer, AI Automation Specialist or Design Technologist roles.',
    h: { summary: 'Professional Summary', experience: 'Professional Experience', projects: 'Projects', skills: 'Skills', education: 'Education', languages: 'Languages' },
    summary:
      'UX/UI Product Designer and AI Product Designer based in Barcelona. I design and launch digital products end to end (discovery, user research, information architecture, Figma prototypes, responsive UI and design systems) and integrate generative AI, conversational agents and automations with OpenAI, Claude, Gemini, Botpress, Make, n8n and Vapi. Master in AI Agents and Process Hyperautomation (EBIS Business Techschool) and 17+ years of professional experience in B2B business and operations, including managing 100+ corporate accounts: I design with a focus on users, feasibility, conversion and efficiency.',
    stats: [
      { n: '17+', l: 'years of B2B business and operations experience' },
      { n: '100+', l: 'corporate accounts managed at Atento Chile (service for Movistar Empresas)' },
      { n: '27', l: 'nodes in the n8n workflow of the Just Enjoy master thesis (team project)' },
      { n: '287', l: 'open source web resources in 7 languages (Rodd.es)' },
    ],
    experience: [
      {
        role: 'Product Designer UX/UI | Applied AI and Automation',
        org: 'Rodrigo Negrete · Independent professional',
        place: 'Barcelona / remote',
        dates: '2024 – Present',
        current: true,
        bullets: [
          'Design and launch digital products from research, benchmarking and flow definition to Figma prototypes, responsive interfaces, automations and web publishing.',
          'Integrate OpenAI, Claude, Gemini, Botpress, Make, n8n and Vapi for personalization, first-line support, operational automation and product experimentation.',
          'Work with HTML, CSS, JavaScript, React, WordPress and Shopify to validate feasibility with engineering, launch MVPs and learn from real products.',
        ],
      },
      {
        role: 'B2B Collections Manager | Orange Empresas',
        org: 'Abai Group (formerly Atento España; via Adecco, temp agency) · Orange Empresas client',
        place: 'Barcelona',
        dates: 'Aug 2024 – Present',
        current: true,
        bullets: [
          'Manage sensitive information, corporate portfolio, incidents and payment agreements with traceability, impact-based prioritization and cross-team coordination.',
          'Use advanced Excel, Microsoft Copilot and internal tools built with HTML/JavaScript to improve reporting, visibility and operational efficiency.',
        ],
      },
      {
        role: 'Operations and Customer Experience Coordinator',
        org: 'Garden España',
        place: 'Barcelona',
        dates: 'Sep 2022 – Aug 2024',
        bullets: [
          'Coordinated a team, incidents and processes; identified friction points and digitized protocols to improve traceability, response time and service experience.',
        ],
      },
      {
        role: 'E-commerce Founder | UX/UI and Web Designer',
        org: 'ParaTuMundo',
        place: 'Barcelona',
        dates: 'Jan 2022 – Dec 2023',
        bullets: [
          'Founded and ran a Shopify e-commerce store: market research, value proposition, architecture, catalog, product pages, content, SEO, analytics and conversion rate optimization (CRO).',
        ],
      },
      {
        role: 'Billing Analyst',
        org: 'Atento Chile (service for Movistar Empresas)',
        place: 'Chile',
        dates: 'Aug 2016 – Oct 2019',
        bullets: [
          'Managed the full billing cycle: invoice review and analysis to detect errors and ensure the accuracy of billed information.',
          'Implemented quality controls that improved the accuracy of reports and internal processes.',
        ],
      },
      {
        role: 'Account Manager / Sales Advisor',
        org: 'Atento Chile (service for Movistar Empresas)',
        place: 'Chile',
        dates: 'Oct 2008 – Aug 2016',
        bullets: [
          'Managed a portfolio of 100+ corporate accounts: personalized service, needs follow-up, contract negotiation, deal closing and strategic account loyalty in telecommunications. A direct foundation for designing products with a business mindset.',
        ],
      },
    ],
    projects: [
      { name: 'ZODI · AI product, PWA, freemium', url: 'rodrigonegrete.es/zodi/', text: 'Astrology, tarot, numerology and community product with a personalized AI conversational chat, UX writing and its own visual identity. 17 reading types, 4 response tones, premium plans. Botpress, Make and OpenAI.' },
      { name: 'Just Enjoy · Team master thesis, grade 10/10', url: 'rodrigonegrete.es/just-enjoy/', text: 'Team project (3 members): travel hyperautomation platform with AI agents (27-node n8n workflow, GPT-4.1 and Next.js). My part: frontend, UX/UI design and interfaces, and part of the n8n automation.' },
      { name: 'Iberdata · Master final business case, solo project, exam 10/10', url: 'rodrigonegrete.es/iberdata/', text: 'AI Center of Excellence for a 450-employee company: governance, RAG architecture, 2 pilots, 12-week plan, KPIs and risk matrix.' },
      { name: 'Events Planner · PWA for wedding planners', url: 'rodrigonegrete.es/aem/', text: 'Offline-capable web app for a wedding studio, with a private couple portal, seating plan and printable contract; 15 database tests (pgTAP).' },
      { name: 'Dedícalo Play · real-time multiplayer game', url: 'rodrigonegrete.es/dedicalo-play/', text: 'Browser-based musical party game built with React and Supabase: concept, mechanics, branding, UX/UI and launch. 3 game modes.' },
      { name: 'Invitoo · wedding tech with AI (founder)', url: 'rodrigonegrete.es/invitoo/', text: 'Digital invitations with RSVP, animations, AI-generated songs (Suno) and Make automations. End-to-end UX/UI and web publishing.' },
      { name: 'Rodd.es · multilingual open source library', url: 'rodd.es', text: '287 web resources (effects, React components, microinteractions, 3D scenes) with live preview and 7 native languages.' },
      { visualOnly: true, name: 'PDF Rodd · web tool', url: 'rodrigonegrete.es/pdf-rodd/', text: 'Edit, sign, highlight, correct and compress PDFs with local processing (PDF.js, PDF-lib, Fabric.js).' },
      { name: 'Te Atiendo · UX research and service design', url: 'rodrigonegrete.es/te-atiendo/', text: 'Restaurant service experience: 20 surveys and interviews (90% value rating the service), benchmark, SWOT, journey map and Figma prototype.' },
      { visualOnly: true, name: 'ParaTuMundo · e-commerce and research', url: 'rodrigonegrete.es/paratumundo/', text: '33 surveys and interviews, 3 competitors audited, personas, journey map, information architecture and Figma prototype.' },
    ],
    skills: [
      { cat: 'Product design and research', items: ['Product discovery', 'problem framing', 'user research', 'interviews and surveys', 'benchmarking', 'SWOT analysis', 'personas', 'customer journey', 'service design', 'information architecture', 'user flows', 'wireframes', 'low and high fidelity prototypes', 'usability testing', 'Design Thinking', 'Design Sprint', 'Lean UX', 'Agile/Scrum'] },
      { cat: 'UI and design systems', items: ['Figma', 'FigJam', 'auto layout', 'components and variants', 'design systems', 'design tokens', 'responsive and mobile-first', 'accessibility (WCAG principles)', 'microinteractions', 'UX writing', 'documentation and developer handoff'] },
      { cat: 'AI and automation', items: ['generative AI', 'prompt engineering', 'OpenAI', 'Claude', 'Gemini', 'Google AI Studio', 'Stitch', 'conversational agents', 'Botpress', 'Vapi', 'Make', 'n8n', 'hyperautomation', 'APIs and webhooks', 'RAG (architecture design)'] },
      { cat: 'Front-end and CMS', items: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Tailwind CSS', 'WordPress', 'Elementor', 'Shopify', 'Supabase', 'Firebase', 'GitHub'] },
      { cat: 'Analytics and business', items: ['GA4', 'Hotjar', 'CRO', 'funnels', 'KPIs', 'advanced Excel', 'Power BI', 'Google Workspace', 'Notion', 'Jira', 'B2B enterprise', 'e-commerce', 'MVP', 'stakeholder management'] },
    ],
    education: [
      { title: 'Master in AI Agents and Process Hyperautomation', school: 'EBIS Business Techschool, Barcelona', dates: 'Nov 2025 – Aug 2026 (completed)', cert: '/assets/legacy/Certificado%20EBIS%20IA.pdf' },
      { title: 'Specialization in Generative AI', school: 'UDIA', dates: '2025 – 2026 (in progress)' },
      { title: 'UX/UI Design Bootcamp, 300 hours', school: 'Neoland, Madrid', dates: 'Jan – Mar 2024', cert: '/assets/legacy/Neoland.pdf' },
      { title: 'Multimedia Web Design and Digital Marketing', school: 'CIPSA.NET, Barcelona', dates: '2020 – 2022' },
      { title: 'Higher Technician in Financial Administration', school: 'Duoc UC, Santiago, Chile', dates: '2014 – 2016', cert: '/assets/legacy/Duoc.pdf' },
    ],
    languages: [
      { l: 'Spanish', level: 'native' },
      { l: 'English', level: 'A2 (elementary)' },
      { l: 'Catalan', level: 'A2 (elementary)' },
    ],
    ui: { certLabel: 'Certificate (PDF)' },
  },
};
