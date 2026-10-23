// Datos de los 5 temas. Compartido por las islas (SSR + cliente) y por el script inline del Layout.
export const AVATARS = {
  saas: '/assets/profile/fotoperfil0001.webp',
  editorial: '/assets/profile/fotoperfil0002.webp',
  cyber: '/assets/legacy/foto-estilo3.webp',
  diario: '/assets/profile/perfilrod.webp',
  hud: '/assets/profile/fotoperfil0003.webp',
};

export const THEMES = [
  { id: 'saas', name: 'Dual Core AI', grad: 'linear-gradient(135deg,#00d4d4,#ff3333)', tp: 'tp-saas', desc: 'Inter · Teal & Red',
    bar: { background: '#00d4d4', opacity: 0.7 }, bar2: { background: '#ff3333', opacity: 0.7 }, acc: { background: '#00d4d4' }, btn: { background: '#000', border: '1px solid #00d4d4', opacity: 0.8 } },
  { id: 'editorial', name: 'El Diario Digital', grad: 'linear-gradient(135deg,#f4f1ea,#8b0000)', tp: 'tp-edit', desc: 'Lora · Sepia y Tinta',
    bar: { background: 'rgba(26,26,26,.8)' }, bar2: { background: '#8b0000', opacity: 0.8 }, acc: { background: '#8b0000' }, btn: { background: '#1a1a1a' } },
  { id: 'cyber', name: 'Abstract Cyber', grad: 'linear-gradient(135deg,#b026ff,#00f0ff)', tp: 'tp-cyber', desc: 'Outfit · Neón y Plasma',
    bar: { background: '#00f0ff', opacity: 0.6 }, bar2: { background: '#b026ff', opacity: 0.6 }, acc: { background: '#00f0ff' }, btn: { background: '#00f0ff', opacity: 0.7 } },
  { id: 'diario', name: 'Minimal Journal', grad: 'linear-gradient(135deg,#fafafa,#0052cc)', tp: 'tp-diar', desc: 'Inter · Blanco y Azul',
    bar: { background: 'rgba(0,0,0,.15)' }, bar2: { background: '#0052cc', opacity: 0.6 }, acc: { background: '#0052cc' }, btn: { background: '#111111' } },
  { id: 'hud', name: 'Fine Art', grad: 'linear-gradient(135deg,#d4b87a,#101010)', tp: 'tp-hud', desc: 'Playfair · Negro mate dorado',
    bar: { background: 'rgba(255,255,255,.12)' }, bar2: { background: '#d4b87a', opacity: 0.55 }, acc: { background: '#d4b87a' }, btn: { background: '#d4b87a', opacity: 0.75 } },
];
