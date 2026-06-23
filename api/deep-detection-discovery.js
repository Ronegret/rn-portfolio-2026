const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function plainValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  return String(value || '').trim();
}

function findAnswer(sections, id) {
  for (const section of sections || []) {
    const answer = (section.answers || []).find(item => item.id === id);
    if (answer) return plainValue(answer.value);
  }
  return '';
}

function renderSections(sections) {
  return (sections || []).map(section => `
    <section style="margin:0 0 26px;padding:20px;border:1px solid #dce7f5;border-radius:18px;background:#f8fbff;">
      <h2 style="margin:0 0 14px;color:#07111f;font-size:20px;line-height:1.2;">${escapeHtml(section.title)}</h2>
      ${(section.answers || []).map(answer => {
        const value = plainValue(answer.value);
        return `
          <div style="margin:0 0 14px;">
            <p style="margin:0 0 5px;color:#1e88e5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">${escapeHtml(answer.label)}</p>
            <p style="margin:0;color:#26364d;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(value || 'Sin respuesta')}</p>
          </div>
        `;
      }).join('')}
    </section>
  `).join('');
}

function buildOwnerEmail({ sections, submittedAt }) {
  const name = findAnswer(sections, 'name') || 'Sin nombre';
  const role = findAnswer(sections, 'role') || 'Sin cargo';
  const email = findAnswer(sections, 'email') || 'Sin email';
  const date = new Date(submittedAt || Date.now()).toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  });

  return `
    <div style="margin:0;padding:0;background:#eef4fb;font-family:Inter,Arial,sans-serif;color:#07111f;">
      <div style="max-width:860px;margin:0 auto;padding:34px 18px;">
        <div style="padding:28px;border-radius:24px;background:#07111f;color:#ffffff;margin-bottom:22px;">
          <p style="margin:0 0 8px;color:#00d4ff;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;">Deep Detection Discovery</p>
          <h1 style="margin:0 0 16px;font-size:30px;line-height:1.15;">Nuevo Discovery completado</h1>
          <p style="margin:0;color:#b8c4d6;line-height:1.6;">Fecha: ${escapeHtml(date)}</p>
          <p style="margin:10px 0 0;color:#ffffff;line-height:1.6;"><strong>${escapeHtml(name)}</strong> · ${escapeHtml(role)} · ${escapeHtml(email)}</p>
        </div>
        ${renderSections(sections)}
      </div>
    </div>
  `;
}

function buildClientEmail({ name, sections }) {
  return `
    <div style="margin:0;padding:0;background:#eef4fb;font-family:Inter,Arial,sans-serif;color:#07111f;">
      <div style="max-width:860px;margin:0 auto;padding:34px 18px;">
        <div style="padding:30px;border-radius:24px;background:#07111f;color:#ffffff;margin-bottom:22px;">
          <p style="margin:0 0 8px;color:#00d4ff;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;">Deep Detection Discovery</p>
          <h1 style="margin:0 0 18px;font-size:30px;line-height:1.15;">Gracias por completar el Discovery Workshop</h1>
          <p style="margin:0 0 16px;color:#dfe8f7;line-height:1.7;">Hola ${escapeHtml(name || 'equipo')},</p>
          <p style="margin:0 0 16px;color:#dfe8f7;line-height:1.7;">Muchas gracias por dedicar tiempo a completar este Discovery. He recibido correctamente vuestras respuestas y las revisaré con detalle para entender mejor objetivos, productos, prioridades y posibles fases del proyecto.</p>
          <p style="margin:0 0 16px;color:#dfe8f7;line-height:1.7;">Esta información me ayudará a preparar una propuesta más realista, estructurada y alineada con Deep Detection.</p>
          <p style="margin:0 0 24px;color:#dfe8f7;line-height:1.7;">A continuación dejo una copia de las respuestas enviadas para que también tengáis registro del contexto compartido.</p>
          <p style="margin:0;color:#ffffff;line-height:1.6;"><strong>Rodrigo Negrete</strong><br>Product Designer · UX/UI · IA aplicada<br><a style="color:#00d4ff;" href="https://rodrigonegrete.es">rodrigonegrete.es</a></p>
        </div>
        ${renderSections(sections)}
      </div>
    </div>
  `;
}

async function sendResendEmail({ apiKey, from, to, subject, html, replyTo }) {
  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      reply_to: replyTo ? [replyTo] : undefined,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'Resend rejected the email request.');
  }
  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.DISCOVERY_TO_EMAIL || 'rodrigo.negrete.aros@gmail.com';
  const replyEmail = process.env.DISCOVERY_REPLY_EMAIL || 'rodrigo.negrete.aros@gmail.com';
  const fromEmail = process.env.DISCOVERY_FROM_EMAIL || 'Rodrigo Negrete <discovery@rodrigonegrete.es>';

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY environment variable.' });
  }

  const payload = req.body || {};
  if (payload.honeypot) {
    return res.status(200).json({ ok: true });
  }

  const sections = Array.isArray(payload.sections) ? payload.sections : [];
  const name = findAnswer(sections, 'name');
  const role = findAnswer(sections, 'role');
  const email = findAnswer(sections, 'email');

  if (!name || !role || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Name, role and a valid email are required.' });
  }

  try {
    await sendResendEmail({
      apiKey,
      from: fromEmail,
      to: toEmail,
      subject: 'Nuevo Discovery completado - Deep Detection',
      html: buildOwnerEmail({ sections, submittedAt: payload.submittedAt }),
      replyTo: email,
    });

    await sendResendEmail({
      apiKey,
      from: fromEmail,
      to: email,
      subject: 'Gracias por completar el Deep Detection Discovery',
      html: buildClientEmail({ name, sections }),
      replyTo: replyEmail,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Email delivery failed.' });
  }
};
