/* ===== EP CAPA DE CAMBIOS: INICIO =====
   Copia de prueba de estudiospublicos.cl. Aquí van los cambios que necesitan
   tocar el HTML. Se carga al final de cada página de la copia.
   Cada bloque lleva un número que coincide con ep-cambios.css.
   ===================================== */
(function () {
  'use strict';

  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var texto = function (el) { return (el && el.textContent || '').replace(/\s+/g, ' ').trim(); };

  // Dirección real de la página (en la copia se traduce a estudiospublicos.cl)
  function urlReal() {
    var p = location.pathname;
    if (p.indexOf('/ep-prueba/') === 0) {
      return 'https://estudiospublicos.cl/index.php/cep/' + p.slice('/ep-prueba/'.length).replace(/\/$/, '');
    }
    return location.href.split('#')[0];
  }

  /* 0. Copia de prueba: los formularios no envían nada al sitio real
        (login, registro, suscripción, newsletter). La búsqueda abre el buscador real. */
  function esBusqueda(form) {
    var a = (form.getAttribute('action') || '').toLowerCase();
    return a.indexOf('busqueda') !== -1 || a.indexOf('/search') !== -1;
  }
  function avisar(form) {
    if (!form || form.querySelector('.ep-form-desactivado')) return;
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

  /* 1. Accesibilidad: idioma válido, imágenes decorativas y título principal */
  var lang = document.documentElement.getAttribute('lang') || '';
  if (/^es[_-]/i.test(lang)) document.documentElement.setAttribute('lang', 'es');
  if (/^en[_-]/i.test(lang)) document.documentElement.setAttribute('lang', 'en');
  $$('img:not([alt])').forEach(function (img) { img.setAttribute('alt', ''); });
  var tituloPrincipal = $('.slider-1 .content .title') || $('#single-numero .content-section .title1') || $('#single-numero .title-right-box .title1');
  if (tituloPrincipal && !$('h1')) {
    tituloPrincipal.setAttribute('role', 'heading');
    tituloPrincipal.setAttribute('aria-level', '1');
  }

  /* 3. Portada en celular: primer párrafo de la presentación y botón «Leer más» */
  (function () {
    var desc = $('.slider-1 .description');
    var p = desc && desc.querySelector('p');
    if (!p || p.querySelector('.ep-intro-mas')) return;
    var partes = p.innerHTML.split(/<br\s*\/?>\s*<br\s*\/?>/i);
    if (partes.length < 2) return;
    p.innerHTML = partes[0] + '<span class="ep-intro-mas"><br><br>' + partes.slice(1).join('<br><br>') + '</span>';
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ep-leer-mas';
    b.setAttribute('aria-expanded', 'false');
    b.textContent = 'Leer más sobre la revista';
    b.addEventListener('click', function () {
      var corta = desc.classList.toggle('ep-intro-corta');
      b.setAttribute('aria-expanded', corta ? 'false' : 'true');
      b.textContent = corta ? 'Leer más sobre la revista' : 'Leer menos';
    });
    desc.classList.add('ep-intro-corta');
    desc.appendChild(b);
  })();

  /* 5. Barra lateral: inicio de sesión plegado tras un botón */
  $$('.box-login').forEach(function (box) {
    var form = box.querySelector('#form-login');
    if (!form || box.querySelector('.ep-acceso')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ep-acceso';
    b.setAttribute('aria-expanded', 'false');
    b.textContent = 'Acceso suscriptores';
    b.addEventListener('click', function () {
      var plegado = box.classList.toggle('ep-plegado');
      b.setAttribute('aria-expanded', plegado ? 'false' : 'true');
      if (!plegado) { var u = form.querySelector('input'); if (u) u.focus(); }
    });
    box.classList.add('ep-plegado');
    box.insertBefore(b, box.firstChild);
  });

  /* 6. Artículo: autores bajo el título y enlaces para compartir que funcionan */
  (function () {
    var art = $('#single-numero.article-details');
    if (!art) return;
    var h2 = $('.content-section .title1', art);
    var autor = $('.section-article h6.author', art);
    if (h2 && autor && !$('.ep-autores', art)) {
      var nombres = $$('.name', autor).map(function (n) { return texto(n).replace(/,$/, ''); }).filter(Boolean);
      if (nombres.length) {
        var p = document.createElement('p');
        p.className = 'ep-autores';
        p.textContent = nombres.length > 1
          ? nombres.slice(0, -1).join(', ') + ' y ' + nombres[nombres.length - 1]
          : nombres[0];
        h2.parentNode.insertBefore(p, h2.nextSibling);
        autor.style.display = 'none';
      }
    }
  })();

  // Compartir (artículo y número): el tema armaba los enlaces sin «https://» y con
  // el asunto del correo mal codificado («estÃ¡ publicaciÃ³n»).
  (function () {
    var links = $$('.shareSocialNetworkHeader a.shareLink');
    if (!links.length) return;
    var url = urlReal();
    var h = $('#single-numero .content-section .title1') || $('#single-numero .title-right-box .title1');
    var titulo = texto(h) || document.title;
    var e = encodeURIComponent;
    links.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('mailto:') === 0) {
        a.href = 'mailto:?subject=' + e('Estudios Públicos: ' + titulo) + '&body=' + e(url);
        a.setAttribute('aria-label', 'Compartir por correo');
        a.removeAttribute('target');
      } else if (href.indexOf('facebook') !== -1) {
        a.href = 'https://www.facebook.com/sharer/sharer.php?u=' + e(url);
        a.setAttribute('aria-label', 'Compartir en Facebook');
      } else if (href.indexOf('linkedin') !== -1) {
        a.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + e(url);
        a.setAttribute('aria-label', 'Compartir en LinkedIn');
      } else if (href.indexOf('twitter') !== -1) {
        a.href = 'https://twitter.com/intent/tweet?url=' + e(url) + '&text=' + e(titulo);
        a.setAttribute('aria-label', 'Compartir en X');
      }
      a.rel = 'noopener';
    });
  })();

  /* 8. Número: año y cuántos textos trae cada sección, con enlace a cada una */
  (function () {
    var cont = $('#single-numero:not(.article-details)');
    var caja = cont && $('.title-right-box', cont);
    if (!caja || $('.ep-resumen-numero', caja)) return;
    var nombres = {
      'artículos': ['artículo', 'artículos'],
      'notas de investigación': ['nota de investigación', 'notas de investigación'],
      'reseñas': ['reseña', 'reseñas'],
      'ensayos': ['ensayo', 'ensayos'],
      'entrevistas': ['entrevista', 'entrevistas'],
      'documentos': ['documento', 'documentos'],
      'presentación': ['presentación', 'presentaciones']
    };
    var items = [];
    $$('h3.title', cont).forEach(function (h3, i) {
      if (h3.closest('.sidebar')) return;
      var sec = h3.closest('.section') || h3.parentNode;
      var n = $$('h4', sec).filter(function (h) { return !h.closest('.slick-cloned'); }).length;
      if (!n) return;
      var nombre = texto(h3).toLowerCase();
      var formas = nombres[nombre] || [nombre, nombre];
      h3.id = h3.id || 'ep-seccion-' + (i + 1);
      h3.classList.add('ep-ancla');
      items.push('<li><a href="#' + h3.id + '">' + n + ' ' + (n === 1 ? formas[0] : formas[1]) + '</a></li>');
    });
    var anio = (document.title.match(/\((\d{4})\)/) || [])[1];
    if (anio) items.unshift('<li><span>' + anio + '</span></li>');
    if (!items.length) return;
    var ul = document.createElement('ul');
    ul.className = 'ep-resumen-numero';
    ul.setAttribute('aria-label', 'Contenido del número');
    ul.innerHTML = items.join('');
    var desc = $('.text-description', caja);
    if (desc && !texto(desc)) desc.style.display = 'none';
    // va justo antes de los botones (PDF, Kindle, e-book): en celular no aprieta la portada
    var opciones = $('.main-section .options', cont);
    if (opciones) opciones.parentNode.insertBefore(ul, opciones);
    else caja.appendChild(ul);
    // alineada con el título o con el primer botón, lo que esté más a la izquierda
    var h2 = $('.title1', caja);
    function alinear() {
      ul.style.marginLeft = '0px';
      var base = ul.getBoundingClientRect().left;
      var bordes = [h2, opciones && opciones.firstElementChild].filter(Boolean)
        .map(function (el) { return el.getBoundingClientRect().left; });
      if (bordes.length) ul.style.marginLeft = Math.max(0, Math.min.apply(null, bordes) - base) + 'px';
    }
    alinear();
    window.addEventListener('resize', alinear);
    window.addEventListener('load', alinear);
  })();
})();
/* ===== EP CAPA DE CAMBIOS: FIN ===== */
