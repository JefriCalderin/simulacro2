import { getCurrentUser, isManager, isCollaborator } from '../services/auth.js';
import { getProjects, getUserProjects } from '../services/api.js';
import { formatDate, statusBadge } from '../utils/helpers.js';

// Renderiza el dashboard con estadisticas y proyectos recientes
export async function renderDashboard() {
  console.log('renderDashboard iniciado');
  const user = getCurrentUser();
  const container = document.getElementById('main-content');
  container.innerHTML = '<div class="loader-wrap"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

  try {
    const role = getRole();
    const projects = await loadProjectsByRole(role, user.id);
    const stats = getStats(role, projects);
    const sorted = [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const rowsToShow = role === 'manager' ? sorted.slice(0, 5) : sorted;
    const headerBadge = getHeaderBadge(role);
    const sectionTitle = role === 'manager' ? 'Recent Projects' : 'My Projects';

    container.innerHTML = `
      <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 class="h3 mb-0 text-gray-800">Dashboard</h1>
          <span class="text-gray-600 small">Welcome, <strong>${user.name}</strong></span>
        </div>
        ${headerBadge}
      </div>
      <div class="row">
        ${stats.map((item) => statCard(item)).join('')}
      </div>
      <div class="row">
        <div class="col-lg-12 mb-4">
          <div class="card shadow mb-4">
            <div class="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 class="m-0 font-weight-bold text-primary">${sectionTitle}</h6>
              ${role === 'manager' ? '<a href="#/projects" class="btn btn-primary btn-sm">View All</a>' : ''}
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr><th>Name</th><th>Status</th><th>Created</th><th class="text-end">Actions</th></tr>
                  </thead>
                  <tbody>
                    ${rowsToShow.map(projectRow).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>`;

  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
  }
}

function getRole() {
  if (isManager()) return 'manager';
  if (isCollaborator()) return 'collaborator';
  return 'guest';
}

async function loadProjectsByRole(role, userId) {
  if (role === 'manager') return await getProjects();
  if (role === 'collaborator') return await getUserProjects(userId);
  return [];
}

function getStats(role, projects) {
  const total = projects.length;
  const completed = projects.filter((project) => project.status === 'completed').length;
  const pending = projects.filter((project) => project.status === 'pending').length;
  const active = projects.filter((project) => project.status !== 'completed').length;

  if (role === 'manager') {
    return [
      { label: 'Total Projects', count: total, icon: 'bi-folder', color: 'primary' },
      { label: 'Active', count: active, icon: 'bi-activity', color: 'info' },
      { label: 'Completed', count: completed, icon: 'bi-check-circle', color: 'success' },
      { label: 'Pending', count: pending, icon: 'bi-clock', color: 'warning' }
    ];
  }

  return [
    { label: 'Assigned', count: total, icon: 'bi-folder', color: 'primary' },
    { label: 'Pending', count: pending, icon: 'bi-clock', color: 'warning' },
    { label: 'In Progress', count: active - pending, icon: 'bi-activity', color: 'info' },
    { label: 'Completed', count: completed, icon: 'bi-check-circle', color: 'success' }
  ];
}

function getHeaderBadge(role) {
  if (role === 'manager') return '<span class="badge bg-primary">Manager</span>';
  if (role === 'collaborator') return '<span class="badge bg-info">Collaborator</span>';
  return '';
}

function projectRow(project) {
  return `
    <tr>
      <td class="fw-semibold text-gray-800">${project.name}</td>
      <td>${statusBadge(project.status)}</td>
      <td class="small">${formatDate(project.createdAt)}</td>
      <td class="text-end"><a href="#/projects/${project.id}" class="btn btn-primary btn-sm">View</a></td>
    </tr>`;
}

function statCard(item) {
  return `
    <div class="col-6 col-md-6 col-xl-3 mb-4">
      <div class="card border-left-${item.color} shadow h-100 py-2 stat-card">
        <div class="card-body">
          <div class="row g-0 align-items-center">
            <div class="col me-2">
              <div class="text-xs font-weight-bold text-${item.color} text-uppercase mb-1">${item.label}</div>
              <div class="h5 mb-0 font-weight-bold text-gray-800">${item.count}</div>
            </div>
            <div class="col-auto">
              <i class="bi ${item.icon} fa-2x text-gray-300 stat-icon"></i>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}
