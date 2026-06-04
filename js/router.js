import { isLoggedIn, getCurrentUser, logout } from './services/auth.js';
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderProjects } from './views/projects.js';
import { renderProjectForm } from './views/projectForm.js';
import { renderProjectDetail } from './views/projectDetail.js';
import { initDarkMode, toggleDarkMode, isDarkMode } from './utils/darkMode.js';
import { showToast } from './utils/toast.js';

// Router simple: define rutas y handlers

const routes = [
  { path: '/login',              handler: renderLogin,          guard: null },
  { path: '/dashboard',          handler: renderDashboard,      guard: 'auth' },
  { path: '/projects',           handler: renderProjects,       guard: 'auth' },
  { path: '/projects/new',       handler: renderProjectForm,    guard: 'manager' },
  { path: '/projects/:id',       handler: renderProjectDetail,  guard: 'auth' },
  { path: '/projects/:id/edit',  handler: renderProjectForm,    guard: 'manager' },
];

function matchRoute(path) {
  path = path || '/login';
  for (const route of routes) {
    const pattern = route.path.replace(/:id/g, '(\\d+)');
    const regex = new RegExp(`^${pattern}$`);
    const match = path.match(regex);
    if (match) {
      const params = match[1] ? { id: match[1] } : {};
      return { ...route, params };
    }
  }
  return null;
}

function checkGuard(guard, currentPath) {
  // Si intenta acceder a login pero ya está logeado
  if (currentPath === '/login' && isLoggedIn()) {
    showToast('Ya estás logeado', 'info');
    window.location.hash = '#/dashboard';
    return false;
  }
  
  if (guard === 'auth' && !isLoggedIn()) {
    showToast('Debes iniciar sesión', 'warning');
    window.location.hash = '#/login';
    return false;
  }
  if (guard === 'manager') {
    if (!isLoggedIn()) {
      showToast('Debes iniciar sesión', 'warning');
      window.location.hash = '#/login';
      return false;
    }
    const user = getCurrentUser();
    if (!user || user.role !== 'manager') {
      showToast('No tienes permisos para acceder aquí', 'warning');
      window.location.hash = '#/dashboard';
      return false;
    }
  }
  return true;
}

function getCurrentPath() {
  let path = window.location.hash.replace('#', '') || '/login';
  return path;
}

function getUserLogo(user) {
  if (!user) return { icon: 'bi-kanban', animation: 'rotate-n-15' };
  if (user.role === 'manager') return { icon: 'bi-briefcase-fill', animation: 'rotate-n-15' };
  if (user.role === 'collaborator') return { icon: 'bi-person-badge-fill', animation: 'rotate-n-15' };
  return { icon: 'bi-people-fill', animation: 'rotate-n-15' };
}

// Renderiza el layout protegido con sidebar + topbar
function renderAppLayout(route, params) {
  const app = document.getElementById('app');
  document.body.id = 'page-top';
  const user = getCurrentUser();
  const logo = getUserLogo(user);
  const currentPath = getCurrentPath();
  const isDark = isDarkMode();

  const isDashboard = currentPath === '/dashboard';
  const isProjects = currentPath.startsWith('/projects');
  const isNewProject = currentPath === '/projects/new';

  function activeClass(test) {
    return test ? ' active' : '';
  }

  app.innerHTML = `
    <div id="wrapper">
      <!-- Sidebar -->
      <div class="sidebar" id="accordionSidebar">
        <a class="sidebar-brand d-flex align-items-center justify-content-center" href="#/dashboard">
          <div class="sidebar-brand-icon ${logo.animation}">
            <i class="bi ${logo.icon}"></i>
          </div>
          <div class="sidebar-brand-text mx-3">Project Manager</div>
        </a>
        <div class="sidebar-nav-wrap">
          <hr class="sidebar-divider my-0">
          <div class="nav-item${activeClass(isDashboard)}">
            <a class="nav-link" href="#/dashboard">
              <i class="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </a>
          </div>
          <hr class="sidebar-divider">
          <div class="sidebar-heading">Management</div>
          <div class="nav-item${activeClass(isProjects && !isNewProject)}">
            <a class="nav-link" href="#/projects">
              <i class="bi bi-list-task"></i>
              <span>Projects</span>
            </a>
          </div>
          ${user && user.role === 'manager' ? `
          <div class="nav-item${activeClass(isNewProject)}">
            <a class="nav-link" href="#/projects/new">
              <i class="bi bi-plus-circle"></i>
              <span>New Project</span>
            </a>
          </div>` : ''}
          <div class="d-flex justify-content-start d-md-none px-2 mt-3 mb-2">
            <button class="btn btn-link text-white p-0 sidebar-close-btn" id="sidebarClose" aria-label="Cerrar menú">
              <i class="bi bi-chevron-left fs-4"></i>
            </button>
          </div>
        </div>
        <div class="sidebar-footer">
          <div class="sidebar-user">
            <i class="bi bi-person-circle"></i>
            <div>
              <div>${user.name}</div>
              <small class="text-white-50 text-capitalize">${user.role}</small>
            </div>
          </div>
          <button id="logout-btn" class="btn btn-sm btn-outline-light">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
      <!-- End of Sidebar -->
      <div id="sidebar-backdrop" class="sidebar-backdrop"></div>

      <!-- Content Wrapper -->
      <div id="content-wrapper" class="d-flex flex-column">
        <div id="content">
          <!-- Topbar -->
          <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle me-3 p-0 border-0">
              <i class="bi bi-list fs-4"></i>
            </button>
            <div class="input-group input-group-sm mx-3 d-none d-md-flex" style="max-width:260px">
              <input type="text" id="topbar-search-input" class="form-control" placeholder="Search projects..." aria-label="Search">
              <button class="btn btn-outline-secondary" type="button" id="topbar-search-btn">
                <i class="bi bi-search"></i>
              </button>
            </div>
            <div class="ms-auto d-flex align-items-center gap-2">
              <button id="dark-mode-btn" class="btn btn-mode-toggle ${isDark ? 'mode-target-light' : 'mode-target-dark'}" title="Cambiar modo" aria-label="Cambiar modo">
                <i id="dark-mode-icon" class="bi ${isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill'}"></i>
              </button>
            </div>
          </nav>
          <!-- Begin Page Content -->
          <div class="container-fluid" id="page-content">
            <div id="main-content">
              <div class="loader-wrap"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>
            </div>
          </div>
        </div>
      </div>
      <!-- End of Content Wrapper -->
    </div>
  `;

  document.getElementById('dark-mode-btn').addEventListener('click', toggleDarkMode);
  document.getElementById('logout-btn').addEventListener('click', logout);

  document.getElementById('sidebarClose').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.remove('toggled');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('show');
  });
  document.getElementById('sidebarToggleTop').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('toggled');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.toggle('show');
  });
  const backdropEl = document.getElementById('sidebar-backdrop');
  if (backdropEl) {
    backdropEl.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.remove('toggled');
      backdropEl.classList.remove('show');
    });
  }

  const searchInput = document.getElementById('topbar-search-input');
  const searchBtn = document.getElementById('topbar-search-btn');

  function doSearch() {
    const term = searchInput.value.trim();
    if (term) sessionStorage.setItem('topbarSearchTerm', term);
    else sessionStorage.removeItem('topbarSearchTerm');
    if (getCurrentPath() !== '/projects') {
      navigate('/projects');
    } else {
      handleRoute();
    }
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', doSearch);
  }

  route.handler(params);
}

function renderPublicView(route, params) {
  // En vistas públicas no necesitamos el id de page-top.
  document.body.removeAttribute('id');
  const app = document.getElementById('app');
  app.innerHTML = '';
  route.handler(params);
}

function handleRoute() {
  const path = getCurrentPath();
  const route = matchRoute(path);
  if (!route) {
    document.getElementById('app').innerHTML = '<div class="d-flex align-items-center justify-content-center vh-100"><div class="text-center"><h1 class="display-1 text-muted">404</h1><p>Page not found</p><a href="#/dashboard" class="btn btn-primary">Go Home</a></div></div>';
    return;
  }
  if (!checkGuard(route.guard, route.path)) return;
  if (route.guard) {
    renderAppLayout(route, route.params);
  } else {
    renderPublicView(route, route.params);
  }
}

export function initRouter() {
  initDarkMode();
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function navigate(path) {
  window.location.hash = path;
}
