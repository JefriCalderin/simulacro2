const BASE_URL = 'http://localhost:3000';

// Helper: realiza peticiones HTTP y lanza errores legibles.
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || response.statusText || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return body;
}

export function getUsers() {
  return request('/users');
}

export function getUserByEmail(email) {
  return request(`/users?email=${encodeURIComponent(email)}`);
}

export function getProjects() {
  return request('/projects');
}

export function getProject(id) {
  return request(`/projects/${id}`);
}

export function getUserProjects(userId) {
  return request(`/projects?assignedTo=${userId}`);
}

export function createProject(project) {
  return request('/projects', {
    method: 'POST',
    body: project
  });
}

export function updateProject(id, data) {
  return request(`/projects/${id}`, {
    method: 'PATCH',
    body: data
  });
}

export function deleteProject(id) {
  return request(`/projects/${id}`, {
    method: 'DELETE'
  });
}
