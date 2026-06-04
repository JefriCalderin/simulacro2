import { getCurrentUser, isManager, isCollaborator } from '../services/auth.js';
import { getProject, updateProject, getUsers } from '../services/api.js';
import { formatDate, escapeHtml, statusBadge } from '../utils/helpers.js';
import { navigate } from '../router.js';
import { showToast } from '../utils/toast.js';

// Renderiza detalle de proyecto y permite actualizar el estado para colaboradores.
export async function renderProjectDetail(params) {
  const container = document.getElementById('main-content');
  const user = getCurrentUser();

  if (!params || !params.id) {
    navigate('/projects');
    return;
  }

  container.innerHTML = '<div class="loader-wrap"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

  try {
    const project = await getProject(params.id);
    const users = await getUsers();
    const assignedUser = users.find((u) => u.id === project.assignedTo);
    const canUpdateStatus = isCollaborator() && project.assignedTo === user.id;

    container.innerHTML = `
      <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center gap-3">
          <a href="#/projects" class="btn btn-secondary btn-sm"><i class="bi bi-arrow-left"></i></a>
          <div>
            <h1 class="h3 mb-0 text-gray-800">${escapeHtml(project.name)}</h1>
            <span class="text-gray-600 small">Project details</span>
          </div>
        </div>
        ${statusBadge(project.status)}
      </div>
      <div class="row">
        <div class="col-lg-8 mb-4">
          <div class="card shadow mb-4 border-left-primary">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">Project Information</h6>
            </div>
            <div class="card-body">
              <div class="mb-0">
                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Description</div>
                <p class="text-gray-800 mb-0">${escapeHtml(project.description || 'No description provided')}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4 mb-4">
          <div class="card shadow mb-4">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">Details</h6>
            </div>
            <div class="card-body">
              ${renderDetailField('Created', `<i class="bi bi-calendar me-1"></i>${formatDate(project.createdAt)}`)}
              ${renderDetailField('Assigned To', `<i class="bi bi-person me-1"></i>${escapeHtml(assignedUser ? assignedUser.name : `User #${project.assignedTo}`)}`)}
              <div>
                <div class="text-xs font-weight-bold text-uppercase mb-1 text-gray-600">Status</div>
                ${canUpdateStatus ? renderStatusForm(project.status) : `<p class="mb-0">${statusBadge(project.status)}</p>`}
              </div>
              ${isManager() ? `<hr><a href="#/projects/${project.id}/edit" class="btn btn-warning btn-sm w-100"><i class="bi bi-pencil me-1"></i>Edit Project</a>` : ''}
            </div>
          </div>
        </div>
      </div>`;

    attachStatusUpdate(project, params);
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${escapeHtml(error.message)}</div>`;
  }
}

function renderDetailField(label, valueHtml) {
  return `
    <div class="mb-3">
      <div class="text-xs font-weight-bold text-uppercase mb-1 text-gray-600">${label}</div>
      <p class="text-gray-800 mb-0">${valueHtml}</p>
    </div>`;
}

function renderStatusForm(status) {
  return `
    <div class="d-flex gap-2">
      <select id="status-select" class="form-select form-select-sm">
        <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
        <option value="in_progress" ${status === 'in_progress' ? 'selected' : ''}>In Progress</option>
        <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
      </select>
      <button id="update-status-btn" class="btn btn-primary btn-sm"><i class="bi bi-check-lg"></i></button>
    </div>
    <p id="status-msg" class="mt-2 mb-0 small"></p>`;
}

function attachStatusUpdate(project, params) {
  const updateBtn = document.getElementById('update-status-btn');
  if (!updateBtn) return;

  updateBtn.addEventListener('click', async () => {
    const statusMsg = document.getElementById('status-msg');
    statusMsg.textContent = '';
    const newStatus = document.getElementById('status-select').value;

    try {
      await updateProject(project.id, { status: newStatus });
      showToast('Status updated to ' + newStatus.replace('_', ' '), 'success');
      renderProjectDetail(params);
    } catch (error) {
      statusMsg.textContent = 'Error: ' + error.message;
      statusMsg.className = 'mt-2 mb-0 small text-danger';
    }
  });
}
