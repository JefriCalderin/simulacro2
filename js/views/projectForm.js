import { createProject, updateProject, getProject, getUsers } from '../services/api.js';
import { navigate } from '../router.js';
import { showToast } from '../utils/toast.js';

// Renderiza formulario para crear o editar proyecto.
// El mismo formulario usa validación simple y muestra errores si hace falta.
export async function renderProjectForm(params) {
  const container = document.getElementById('main-content');
  const isEdit = Boolean(params && params.id);
  let project = { name: '', description: '', status: 'pending', assignedTo: '' };

  if (isEdit) {
    container.innerHTML = '<div class="loader-wrap"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    try {
      project = await getProject(params.id);
    } catch (error) {
      container.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
      return;
    }
  }

  const users = await loadUsers();
  container.innerHTML = getFormHtml(isEdit, project, users);

  const form = document.getElementById('project-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    const messageEl = document.getElementById('form-message');
    clearMessage(messageEl);

    const formData = readFormData();
    if (formData.description.length > 500) {
      showError(messageEl, 'Description must be under 500 characters');
      return;
    }

    try {
      if (isEdit) {
        await updateProject(params.id, formData);
        showToast('Project updated successfully', 'success');
        messageEl.textContent = 'Project saved successfully.';
        messageEl.className = 'mt-3 mb-0 small text-success';
      } else {
        await createProject({ ...formData, createdAt: getToday() });
        showToast('Project created successfully', 'success');
        messageEl.textContent = 'Project created successfully. You can add another project now.';
        messageEl.className = 'mt-3 mb-0 small text-success';
        form.reset();
        form.classList.remove('was-validated');
      }
    } catch (error) {
      showError(messageEl, 'Error: ' + error.message);
    }
  });
}

async function loadUsers() {
  try {
    return await getUsers();
  } catch {
    return [];
  }
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function readFormData() {
  return {
    name: document.getElementById('project-name').value.trim(),
    description: document.getElementById('project-desc').value.trim(),
    status: document.getElementById('project-status').value,
    assignedTo: Number(document.getElementById('project-assigned').value)
  };
}

function clearMessage(element) {
  element.textContent = '';
  element.className = 'mt-3 mb-0 small';
}

function showError(element, text) {
  element.textContent = text;
  element.className = 'mt-3 mb-0 small text-danger';
}

function getFormHtml(isEdit, project, users) {
  return `
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
      <div>
        <h1 class="h3 mb-0 text-gray-800">${isEdit ? 'Edit Project' : 'New Project'}</h1>
        <span class="text-gray-600 small">${isEdit ? 'Update the project details below' : 'Fill in the details to create a new project'}</span>
      </div>
    </div>
    <div class="card shadow mb-4">
      <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">Project Information</h6>
      </div>
      <div class="card-body">
        <form id="project-form" class="needs-validation" novalidate style="max-width:600px">
          <div class="mb-3">
            <label for="project-name" class="form-label">Project Name <span class="text-danger">*</span></label>
            <input type="text" id="project-name" class="form-control" value="${project.name}" minlength="3" maxlength="100" required placeholder="Enter project name">
            <div class="invalid-feedback">Name is required (min 3 characters)</div>
          </div>
          <div class="mb-3">
            <label for="project-desc" class="form-label">Description</label>
            <textarea id="project-desc" class="form-control" rows="4" placeholder="Describe the project...">${project.description || ''}</textarea>
            <div class="form-text">Optional. Max 500 characters.</div>
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="project-status" class="form-label">Status</label>
              <select id="project-status" class="form-select">
                <option value="pending" ${project.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="in_progress" ${project.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>
            <div class="col-md-6">
              <label for="project-assigned" class="form-label">Assigned To <span class="text-danger">*</span></label>
              <select id="project-assigned" class="form-select" required>
                <option value="">-- Select a user --</option>
                ${users.map((user) => `
                  <option value="${user.id}" ${Number(project.assignedTo) === user.id ? 'selected' : ''}>${user.name} (${user.role})</option>`).join('')}
              </select>
              <div class="invalid-feedback">Please assign a user</div>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary">
              <i class="bi ${isEdit ? 'bi-check-lg' : 'bi-plus-lg'} me-1"></i>${isEdit ? 'Update' : 'Create'} Project
            </button>
            <a href="#/projects" class="btn btn-secondary">Cancel</a>
          </div>
          <p id="form-message" class="mt-3 mb-0 small"></p>
        </form>
      </div>
    </div>`;
}
