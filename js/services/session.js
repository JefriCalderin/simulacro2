const SESSION_KEY = 'spa_session';

// Guarda datos mínimos del usuario en localStorage
export function saveSession(user) {
  const session = { id: user.id, name: user.name, email: user.email, role: user.role, timestamp: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Recupera sesión o null
export function getSession() {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
}

export function clearSession() { localStorage.removeItem(SESSION_KEY); }
export function isLoggedIn() { return getSession() !== null; }
