import { getCurrentUser, isManager, isCollaborator } from '../services/auth.js';
import { getProjects, getUserProjects, deleteProject } from '../services/api.js';
import { formatDate, escapeHtml, statusBadge } from '../utils/helpers.js';
import { showToast } from '../utils/toast.js';

const ITEMS_PER_PAGE = 5;
let allProjects = [];
let currentPage = 1;
let searchTerm = '';
let statusFilter = '';

function getFilteredProjects() {
  const term = searchTerm.trim().toLowerCase();
  return allProjects.filter((project) => {
    const matchesText = !term ||
      project.name.toLowerCase().includes(term) ||
      (project.description || '').toLowerCase().includes(term);
    const matchesStatus = !statusFilter || project.status === statusFilter;
    return matchesText && matchesStatus;
  });
}

function getPaginatedProjects(filtered) {
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  return {
    items: filtered.slice(start, start + ITEMS_PER_PAGE),
    totalPages,
    total: filtered.length,
    start: start + 1,
    end: Math.min(start + ITEMS_PER_PAGE, filtered.length)
  };
}

function projectRowHtml(project, user) {
  const description = escapeHtml((project.description || '').slice(0, 60));
  const more = project.description && project.description.length > 60 ? '...' : '';
  const assignedLabel = project.assignedTo === user.id
    ? '<span class="badge bg-primary">Me</span>'
    : `<span class="badge bg-secondary">User #${project.assignedTo}</span>`;

  return `
    <tr>
      <td class="fw-semibold text-gray-800">${escapeHtml(project.name)}</td>
      <td class="small">${description}${more}</td>
      <td>${statusBadge(project.status)}</td>
      <td class="small">${formatDate(project.createdAt)}</td>
      <td>${assignedLabel}</td>
      <td class="text-end">
        <a href="#/projects/${project.id}" class="btn btn-primary btn-sm" title="View"><i class="bi bi-eye"></i></a>
        ${isManager() ? `
          <a href="#/projects/${project.id}/edit" class="btn btn-warning btn-sm" title="Edit"><i class="bi bi-pencil"></i></a>
          <button class="btn btn-danger btn-sm btn-delete" data-id="${project.id}" title="Delete"><i class="bi bi-trash"></i></button>
        ` : ''}
        ${isCollaborator() && project.assignedTo === user.id ? `
          <a href="#/projects/${project.id}" class="btn btn-info btn-sm" title="Update Status"><i class="bi bi-arrow-up-circle"></i></a>
        ` : ''}
      </td>
    </tr>`;
}

function paginationHtml(page) {
  if (page.totalPages <= 1) return '';

  const pages = Array.from({ length: page.totalPages }, (_, i) => {
    const num = i + 1;
    return `
      <li class="page-item ${num === currentPage ? 'active' : ''}">
        <button class="page-link page-nav" data-page="${num}">${num}</button>
      </li>`;
  }).join('');

  return `
    <div class="card-footer">
      <nav>
        <ul class="pagination pagination-sm justify-content-center mb-0">
          <li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
            <button class="page-link page-nav" data-page="${currentPage - 1}"><i class="bi bi-chevron-left"></i></button>
          </li>
          ${pages}
          <li class="page-item ${currentPage >= page.totalPages ? 'disabled' : ''}">
            <button class="page-link page-nav" data-page="${currentPage + 1}"><i class="bi bi-chevron-right"></i></button>
          </li>
        </ul>
      </nav>
    </div>`;
}

function renderProjectList(container, user) {
  const filtered = getFilteredProjects();
  const page = getPaginatedProjects(filtered);

  const html = `
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
      <div>
        <h1 class="h3 mb-0 text-gray-800">Projects</h1>
        <span class="text-gray-600 small">${isManager() ? 'All projects' : 'Projects assigned to you'}</span>
      </div>
      ${isManager() ? '<a href="#/projects/new" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-1"></i>New Project</a>' : ''}
    </div>
    <div class="card shadow mb-4">
      <div class="card-header py-3 d-flex align-items-center gap-2 flex-wrap">
        <select id="status-filter" class="form-select form-select-sm" style="width:auto;">
          <option value="">All Status</option>
          <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="in_progress" ${statusFilter === 'in_progress' ? 'selected' : ''}>In Progress</option>
          <option value="completed" ${statusFilter === 'completed' ? 'selected' : ''}>Completed</option>
        </select>
        <div class="ms-auto small text-gray-600">
          ${page.total} project${page.total !== 1 ? 's' : ''}${page.total > 0 ? ` (${page.start}-${page.end})` : ''}
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Assigned</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${page.items.length === 0 ? `<tr><td colspan="6" class="text-center text-muted py-4">No projects found</td></tr>` : page.items.map((project) => projectRowHtml(project, user)).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ${paginationHtml(page)}
    </div>`;

  container.innerHTML = html;
  attachProjectEvents(container, user);
}

function attachProjectEvents(container, user) {
  const statusFilterEl = container.querySelector('#status-filter');

  if (statusFilterEl) {
    statusFilterEl.addEventListener('change', (event) => {
      statusFilter = event.target.value;
      currentPage = 1;
      renderProjectList(container, user);
    });
  }

  container.querySelectorAll('.page-nav').forEach((button) => {
    button.addEventListener('click', () => {
      currentPage = Number(button.dataset.page);
      renderProjectList(container, user);
    });
  });

  container.querySelectorAll('.btn-delete').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!confirm('Delete this project permanently?')) return;
      try {
        await deleteProject(button.dataset.id);
        showToast('Project deleted successfully', 'success');
        allProjects = allProjects.filter((project) => project.id !== Number(button.dataset.id));
        renderProjectList(container, user);
      } catch (error) {
        showToast('Error deleting project: ' + error.message, 'error');
      }
    });
  });
}

// funcion principal: carga proyectos y pinta la tabla
export async function renderProjects() {
  console.log('renderProjects llamado');
  const user = getCurrentUser();
  const container = document.getElementById('main-content');
  container.innerHTML = '<div class="loader-wrap"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

  const savedTerm = sessionStorage.getItem('topbarSearchTerm');
  if (savedTerm) {
    searchTerm = savedTerm;
    sessionStorage.removeItem('topbarSearchTerm');
  } else {
    searchTerm = '';
  }
  currentPage = 1;

  try {
    allProjects = isManager() ? await getProjects() : await getUserProjects(user.id);
    renderProjectList(container, user);
    const topbarInput = document.getElementById('topbar-search-input');
    if (topbarInput) topbarInput.value = searchTerm;
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${escapeHtml(error.message)}</div>`;
  }
}
