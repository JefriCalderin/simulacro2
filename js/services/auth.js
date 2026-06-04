import { getUserByEmail } from './api.js';
import { saveSession, getSession, clearSession, isLoggedIn } from './session.js';

// Autenticación básica usando usuarios precargados en json-server.
export async function login(email, password) {
  const users = await getUserByEmail(email);
  if (!users.length) {
    throw new Error('User not found with this email');
  }

  const user = users[0];
  if (user.password !== password) {
    throw new Error('Incorrect password');
  }

  saveSession(user); // guarda usuario en localStorage
  return user;
}

// Cierra la sesión y vuelve a la pantalla de login.
export function logout() {
  clearSession();
  window.location.hash = '#/login';
}

export function getCurrentUser() {
  return getSession();
}

// Guardas simples para proteger rutas en el router.
export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.hash = '#/login';
    return false;
  }
  return true;
}

export function hasRole(role) {
  const user = getSession();
  return user && user.role === role;
}

export function isManager() {
  return hasRole('manager');
}

export function isCollaborator() {
  return hasRole('collaborator');
}

export function requireManager() {
  if (!requireAuth()) return false;
  if (!isManager()) {
    window.location.hash = '#/dashboard';
    return false;
  }
  return true;
}

export { isLoggedIn };
