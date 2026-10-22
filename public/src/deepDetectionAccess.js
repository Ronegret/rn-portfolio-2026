
const form = document.getElementById('accessForm');
const message = document.getElementById('accessMessage');
const button = form.querySelector('button');

form.addEventListener('submit', async event => {
  event.preventDefault();
  button.disabled = true;
  message.textContent = 'Verificando acceso...';

  try {
    const response = await fetch('/api/discovery-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: form.password.value }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'No se pudo validar la contraseña.');
    window.location.href = '/deep-detection-discovery/';
  } catch (error) {
    message.textContent = error.message || 'Contraseña incorrecta.';
    button.disabled = false;
  }
});
