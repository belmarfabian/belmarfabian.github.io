/* ===== EP CAPA DE CAMBIOS: INICIO =====
   Copia de prueba de estudiospublicos.cl. Aquí van los cambios que necesitan
   tocar el HTML. Se carga al final del <body> en todas las páginas de la copia.
   ===================================== */
(function () {
  'use strict';

  // En la copia, los formularios no envían nada al sitio real (login, registro,
  // suscripción, newsletter). La búsqueda sí funciona: abre el buscador real.
  function esBusqueda(form) {
    var a = (form.getAttribute('action') || '').toLowerCase();
    return a.indexOf('busqueda') !== -1 || a.indexOf('/search') !== -1;
  }

  function avisar(form) {
    if (form.querySelector('.ep-form-desactivado')) return;
    var p = document.createElement('p');
    p.className = 'ep-form-desactivado';
    p.textContent = 'Copia de prueba: este formulario no envía datos.';
    form.appendChild(p);
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM' || esBusqueda(form)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    avisar(form);
  }, true);

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.sendForm, #form-newsletter button, #form-newsletter [type=submit]');
    if (!b) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    avisar(b.closest('form') || b.parentNode);
  }, true);
})();
/* ===== EP CAPA DE CAMBIOS: FIN ===== */
