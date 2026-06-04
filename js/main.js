import { initRouter } from './router.js';
import { isLoggedIn } from './services/session.js';

// Punto de entrada: decide ruta inicial según sesión
document.addEventListener('DOMContentLoaded', () => {
  const startRoute = isLoggedIn() ? '/dashboard' : '/login';
  window.location.hash = startRoute;
  initRouter();
});
