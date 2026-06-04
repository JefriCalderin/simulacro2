// toast para mostrar mensajes al usuario
// se apoya en bootstrap toast

function asegurarContainer() {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(c);
  }
  return c;
}

const iconos = {
  success: 'bi-check-circle-fill',
  error: 'bi-x-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill'
};

const colores = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info'
};

export function showToast(mensaje, tipo = 'success') {
  const container = asegurarContainer();
  const icono = iconos[tipo] || iconos.info;
  const color = colores[tipo] || colores.info;
  const id = 't-' + Date.now();

  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center border-0 fade-in" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3500">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icono} ${color} fs-5"></i>
          <span>${mensaje}</span>
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `);

  const el = document.getElementById(id);
  const toast = new bootstrap.Toast(el);
  toast.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}
