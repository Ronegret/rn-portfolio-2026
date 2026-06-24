const COOKIE_NAME = 'dd_discovery_access';
const ONE_DAY = 60 * 60 * 24;

function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const expected = process.env.DISCOVERY_ACCESS_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: 'Falta configurar DISCOVERY_ACCESS_PASSWORD en Vercel.' });
  }

  const password = String(req.body?.password || '');
  if (!safeEqual(password, expected)) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=granted; Path=/; Max-Age=${ONE_DAY}; HttpOnly; SameSite=Lax${secure}`);
  return res.status(200).json({ ok: true });
};
