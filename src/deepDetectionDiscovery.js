import './deepDetectionDiscovery.css';

const STORAGE_KEY = 'deep-detection-discovery-v1';

const steps = [
  {
    title: '1. Contexto inicial',
    fields: [
      { id: 'name', label: 'Nombre', type: 'text', required: true },
      { id: 'role', label: 'Cargo', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
      { id: 'description', label: '¿Cómo describirías Deep Detection en una frase?', type: 'textarea', wide: true },
      { id: 'mainObjective', label: '¿Cuál es el objetivo principal de esta renovación?', type: 'textarea', wide: true },
    ],
  },
  {
    title: '2. Objetivos y éxito',
    fields: [
      { id: 'objectives', label: '¿Qué objetivos son prioritarios?', type: 'checkbox', options: ['Mejorar imagen profesional', 'Explicar mejor la tecnología', 'Preparar lanzamiento octubre', 'Diferenciarnos', 'Mejorar navegación', 'Generar confianza', 'Reforzar marca', 'Otro'] },
      { id: 'clientPerception', label: '¿Qué debería pensar un cliente cuando entre en la nueva web?', type: 'textarea', wide: true },
      { id: 'successResult', label: '¿Qué resultado consideraríais un éxito?', type: 'textarea', wide: true },
    ],
  },
  {
    title: '3. Productos y lanzamiento',
    fields: [
      { id: 'mainProducts', label: '¿Cuáles son los productos principales?', type: 'textarea', wide: true },
      { id: 'octoberProducts', label: '¿Qué productos se lanzarán en octubre?', type: 'textarea', wide: true },
      { id: 'technologyAdvantages', label: '¿Qué ventajas o conceptos técnicos deben quedar claros?', type: 'textarea', wide: true },
      { id: 'essentialContent', label: '¿Qué contenido es imprescindible para el lanzamiento?', type: 'textarea', wide: true },
    ],
  },
  {
    title: '4. Clientes y decisión',
    fields: [
      { id: 'idealClient', label: '¿Quién es vuestro cliente ideal?', type: 'textarea', wide: true },
      { id: 'decisionRoles', label: '¿Qué cargos participan en la decisión?', type: 'textarea', wide: true },
      { id: 'clientQuestions', label: '¿Qué dudas u objeciones suelen aparecer?', type: 'textarea', wide: true },
    ],
  },
  {
    title: '5. Web actual y material',
    fields: [
      { id: 'currentWorks', label: '¿Qué funciona bien en la web actual y deberíamos conservar?', type: 'textarea', wide: true },
      { id: 'shouldImprove', label: '¿Qué no os representa o deberíamos mejorar?', type: 'textarea', wide: true },
      { id: 'importantPages', label: '¿Qué páginas o contenidos son más importantes?', type: 'textarea', wide: true },
      { id: 'availableAssets', label: 'Material disponible', type: 'checkbox', options: ['Logo', 'Brandbook', 'Fotos', 'Vídeos', 'Renderizados', 'Fichas técnicas', 'Presentaciones', 'Casos de uso', 'Whitepapers', 'Testimonios', 'Otro'] },
    ],
  },
  {
    title: '6. Marca, tono y referencias',
    fields: [
      { id: 'brandAttributes', label: '¿Qué debe transmitir la marca?', type: 'checkbox', options: ['Innovación', 'Precisión', 'Confianza', 'Tecnología', 'Ciencia', 'Simplicidad', 'Liderazgo', 'Industria', 'Cercanía', 'Internacionalización'] },
      { id: 'idealTone', label: '¿Cómo describiríais el tono ideal?', type: 'textarea', wide: true },
      { id: 'directCompetitors', label: 'Competidores o empresas de referencia', type: 'textarea', wide: true },
      { id: 'likedWebsites', label: 'Webs que os gustan o que os gustaría superar', type: 'textarea', wide: true },
    ],
  },
  {
    title: '7. Alcance y siguiente paso',
    fields: [
      { id: 'scope', label: 'Posible alcance', type: 'checkbox', options: ['Mejoras visuales', 'Rediseño parcial', 'Rediseño completo UX/UI', 'Nueva arquitectura', 'Nueva identidad visual', 'Diseño y desarrollo', 'Todavía por definir'] },
      { id: 'topPriorities', label: '¿Cuáles son las tres prioridades principales?', type: 'textarea', wide: true },
      { id: 'importantUnknown', label: '¿Hay algo importante que no hayamos comentado y que deba considerar antes de preparar la propuesta y los futuros diseños?', type: 'textarea', wide: true },
      { id: 'expectations', label: '¿Qué expectativas tenéis sobre mi colaboración?', type: 'textarea', wide: true },
      { id: 'idealNextStep', label: '¿Cuál sería el siguiente paso ideal?', type: 'textarea', wide: true },
    ],
  },
];

let currentStep = 0;
let state = loadState();

const form = document.getElementById('deepDiscoveryForm');
const stepShell = document.getElementById('stepShell');
const progressBar = document.getElementById('progressBar');
const stepLabel = document.getElementById('stepLabel');
const saveLabel = document.getElementById('saveLabel');
const prevButton = document.getElementById('prevStep');
const nextButton = document.getElementById('nextStep');
const submitButton = document.getElementById('submitDiscovery');
const message = document.getElementById('formMessage');
const successPanel = document.getElementById('successPanel');

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveLabel.textContent = `Guardado ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

function esc(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function fieldValue(id) {
  return state[id] || '';
}

function createTextField(field) {
  const wrap = document.createElement('div');
  wrap.className = `dd-field${field.wide ? ' dd-wide' : ''}`;
  const value = fieldValue(field.id);
  const input = field.type === 'textarea'
    ? `<textarea id="${field.id}" name="${field.id}" ${field.required ? 'required' : ''}>${esc(value)}</textarea>`
    : `<input id="${field.id}" name="${field.id}" type="${field.type}" value="${esc(value)}" ${field.required ? 'required' : ''} />`;
  wrap.innerHTML = `
    <label for="${field.id}">${field.label}${field.required ? ' *' : ''}</label>
    ${input}
    <span class="dd-error" data-error-for="${field.id}"></span>
  `;
  const control = wrap.querySelector('input, textarea');
  control.addEventListener('input', () => {
    state[field.id] = control.value;
    persist();
    clearFieldError(field.id);
  });
  return wrap;
}

function createCheckboxField(field) {
  const wrap = document.createElement('fieldset');
  wrap.className = 'dd-checkgroup';
  const selected = Array.isArray(state[field.id]) ? state[field.id] : [];
  wrap.innerHTML = `
    <legend>${field.label}</legend>
    <div class="dd-checks">
      ${field.options.map(option => `
        <label class="dd-check">
          <input type="checkbox" name="${field.id}" value="${esc(option)}" ${selected.includes(option) ? 'checked' : ''} />
          <span>${option}</span>
        </label>
      `).join('')}
    </div>
  `;
  wrap.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', () => {
      state[field.id] = [...wrap.querySelectorAll('input:checked')].map(item => item.value);
      persist();
    });
  });
  return wrap;
}

function renderStep() {
  const step = steps[currentStep];
  stepShell.innerHTML = '';
  const stepEl = document.createElement('div');
  stepEl.className = 'dd-step';
  stepEl.innerHTML = `<h3>${step.title}</h3><div class="dd-field-grid"></div>`;
  const grid = stepEl.querySelector('.dd-field-grid');
  step.fields.forEach(field => {
    grid.appendChild(field.type === 'checkbox' ? createCheckboxField(field) : createTextField(field));
  });
  stepShell.appendChild(stepEl);

  const progress = ((currentStep + 1) / steps.length) * 100;
  progressBar.style.width = `${progress}%`;
  stepLabel.textContent = `Paso ${currentStep + 1} de ${steps.length}`;
  prevButton.disabled = currentStep === 0;
  nextButton.hidden = currentStep === steps.length - 1;
  submitButton.hidden = currentStep !== steps.length - 1;
  message.textContent = '';
  message.className = 'dd-form-message';
}

function clearFieldError(id) {
  const error = document.querySelector(`[data-error-for="${CSS.escape(id)}"]`);
  if (error) error.textContent = '';
}

function showFieldError(id, text) {
  const error = document.querySelector(`[data-error-for="${CSS.escape(id)}"]`);
  if (error) error.textContent = text;
}

function validateStep() {
  let valid = true;
  steps[currentStep].fields.forEach(field => {
    if (!field.required) return;
    const value = String(state[field.id] || '').trim();
    if (!value) {
      showFieldError(field.id, 'Este campo es necesario para enviar el Discovery.');
      valid = false;
    }
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showFieldError(field.id, 'Introduce un email válido.');
      valid = false;
    }
  });
  if (!valid) {
    message.textContent = 'Revisa los campos marcados antes de continuar.';
    message.className = 'dd-form-message dd-bad';
  }
  return valid;
}

prevButton.addEventListener('click', () => {
  currentStep = Math.max(0, currentStep - 1);
  renderStep();
});

nextButton.addEventListener('click', () => {
  if (!validateStep()) return;
  currentStep = Math.min(steps.length - 1, currentStep + 1);
  renderStep();
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!validateStep()) return;

  submitButton.disabled = true;
  prevButton.disabled = true;
  message.textContent = 'Enviando Discovery de forma segura...';
  message.className = 'dd-form-message';

  const payload = {
    submittedAt: new Date().toISOString(),
    honeypot: form.elements.company_website.value,
    sections: steps.map(step => ({
      title: step.title,
      answers: step.fields.map(field => ({
        id: field.id,
        label: field.label,
        value: state[field.id] || (field.type === 'checkbox' ? [] : ''),
      })),
    })),
  };

  try {
    const response = await fetch('/api/deep-detection-discovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'No se pudo enviar el Discovery.');
    localStorage.removeItem(STORAGE_KEY);
    form.hidden = true;
    successPanel.hidden = false;
    successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    message.textContent = error.message || 'Ha ocurrido un error. Puedes intentarlo de nuevo o contactar por email.';
    message.className = 'dd-form-message dd-bad';
    submitButton.disabled = false;
    prevButton.disabled = currentStep === 0;
  }
});

document.querySelectorAll('.dd-reveal').forEach(element => {
  const delay = element.dataset.delay;
  if (delay) element.style.setProperty('--dd-delay', `${delay}ms`);
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('dd-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.dd-reveal').forEach(element => observer.observe(element));

renderStep();
