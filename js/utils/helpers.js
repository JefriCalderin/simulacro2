export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Dev: devuelve HTML con la etiqueta visual del estado
export function statusBadge(status) {
  const map = {
    pending: { label: 'Pending', class: 'bg-warning text-dark' },
    in_progress: { label: 'In Progress', class: 'bg-primary' },
    completed: { label: 'Completed', class: 'bg-success' }
  };
  const s = map[status] || map.pending;
  return `<span class="badge ${s.class}">${s.label}</span>`;
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getStatusLabel(status) {
  const labels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed'
  };
  return labels[status] || status;
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
