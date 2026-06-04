const STORAGE_KEY = 'spa_darkMode';

// Inicializa tema según preferencia o guardado
export function initDarkMode() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const enable = saved !== null ? saved === 'true' : prefersDark;
  setTheme(enable);
  return enable;
}

// Alterna tema y retorna nuevo estado
export function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  setTheme(!current);
  return !current;
}

export function isDarkMode() { return document.documentElement.getAttribute('data-bs-theme') === 'dark'; }

function setTheme(dark) {
  document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
  localStorage.setItem(STORAGE_KEY, String(dark));

  const icon = document.getElementById('dark-mode-icon');
  if (icon) icon.className = dark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';

  const btn = document.getElementById('dark-mode-btn');
  if (!btn) return;
  btn.classList.remove('mode-target-light', 'mode-target-dark');
  btn.classList.add(dark ? 'mode-target-light' : 'mode-target-dark');
  btn.setAttribute('title', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
}
