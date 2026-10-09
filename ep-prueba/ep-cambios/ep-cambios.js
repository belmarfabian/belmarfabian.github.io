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

  /* 9. Estilo CEP: piezas que solo se ven con <html class="ep-cep"> */
  function soloCep(tag, clase, html) {
    var el = document.createElement(tag);
    el.className = clase + ' ep-solo-cep';
    if (html) el.innerHTML = html;
    return el;
  }
  var INICIO = location.pathname.indexOf('/ep-prueba/') === 0 ? '/ep-prueba/' : '/index.php/cep';

  // Indicadores de la revista para la primera pantalla.
  // Fuente de Scopus: nota editorial «Estudios Públicos en Scopus», N° 182 (2026):
  // aceptada en marzo de 2026, con cobertura retroactiva desde 2022.
  // Cuartil SJR, CiteScore y factor de impacto: aún no hay cifras publicadas
  // (SCImago no lista la revista; la revista no declara Web of Science).
  // Cuando existan, se completan aquí y aparecen solas: { valor, detalle, fuente }.
  var INDICADORES = {
    cuartil: null,    // ej. { valor: 'Q2', detalle: 'SJR 2026 · Ciencias Sociales', fuente: 'https://www.scimagojr.com/...' }
    citescore: null,  // ej. { valor: '1,2', detalle: 'CiteScore 2026', fuente: 'https://www.scopus.com/sourceid/...' }
    impacto: null     // ej. { valor: '0,8', detalle: 'JIF 2026 (JCR)', fuente: 'https://jcr.clarivate.com/...' }
  };

  // portada: antetítulo, sello de Scopus y datos de la revista, como en el sitio del CEP
  (function () {
    var cont = $('#home .slider-1 .content');
    var titulo = cont && $('.title', cont);
    if (!titulo || $('.ep-ceja', cont)) return;
    titulo.parentNode.insertBefore(soloCep('p', 'ep-ceja', 'La revista del CEP · desde 1980'), titulo);
    // sin cifra publicada, cada indicador queda como espacio reservado («—»)
    var ETIQUETAS = { cuartil: 'Cuartil SJR', citescore: 'CiteScore', impacto: 'Factor de impacto' };
    var metricas = ['cuartil', 'citescore', 'impacto'].map(function (k) {
      var m = INDICADORES[k];
      if (!m) return '<span class="ep-metrica ep-metrica--pendiente" title="Por completar"><b>—</b>' + ETIQUETAS[k] + '</span>';
      return '<a class="ep-metrica" href="' + m.fuente + '" rel="noopener"><b>' + m.valor + '</b>' + m.detalle + '</a>';
    }).join('');
    // el sello y los indicadores se ven en los dos estilos (el resto de este bloque, solo en el CEP)
    var sello = document.createElement('div');
    sello.className = 'ep-indexada';
    sello.innerHTML = (
      '<a class="ep-indexada__sello" href="' + INICIO + (INICIO.slice(-1) === '/' ? 'indexaciones/' : '/indexaciones') + '">' +
        '<span class="ep-indexada__marca">Scopus</span>' +
        '<span class="ep-indexada__texto"><b>Indexada en Scopus</b>desde 2026 · cobertura desde 2022</span>' +
      '</a><div class="ep-metricas">' + metricas + '</div>');
    titulo.parentNode.insertBefore(sello, titulo.nextSibling);
    var datos = soloCep('ul', 'ep-datos',
      '<li><b>Trimestral</b>periodicidad</li>' +
      '<li><b>Arbitrada</b>revisión por pares</li>' +
      '<li><b>Acceso abierto</b>ISSN 0718-3089</li>' +
      '<li><b>Español e inglés</b>idiomas</li>');
    cont.appendChild(datos);
  })();

  // número y artículo: migas de pan
  (function () {
    var cont = $('#single-numero');
    if (!cont || $('.ep-migas', cont)) return;
    var partes = ['<a href="' + INICIO + '">Inicio</a>', '<a href="' + INICIO + (INICIO.slice(-1) === '/' ? '' : '/') + 'issue/archive' + (INICIO.slice(-1) === '/' ? '/' : '') + '">Números</a>'];
    var destino;
    if (cont.classList.contains('article-details')) {
      var volver = $$('a, button', cont).filter(function (a) { return /volver al volumen/i.test(texto(a)); })[0];
      var hrefNum = volver && (volver.getAttribute('href') || volver.getAttribute('data-href'));
      var cita = texto($('.csl-entry', cont));
      var num = (cita.match(/Estudios Públicos\.?\s*(\d{1,3})\s*\(/) || [])[1];
      if (hrefNum && num) partes.push('<a href="' + hrefNum + '">N° ' + num + '</a>');
      destino = $('.content-section', cont);
      if (destino) destino.insertBefore(soloCep('p', 'ep-migas', partes.join('<span>›</span>')), destino.firstChild);
    } else {
      var caja = $('.title-right-box', cont);
      if (caja) {
        caja.insertBefore(soloCep('p', 'ep-migas', partes.join('<span>›</span>')), caja.firstChild);
        var h2 = $('.title1', caja);
        if (h2) h2.parentNode.insertBefore(soloCep('p', 'ep-ceja', 'Estudios Públicos'), h2);
      }
    }
  })();

  // pie: las redes de la revista (en estilo CEP salen de la cabecera)
  (function () {
    var col = $('footer .widget-contact');
    if (!col || $('.ep-redes-pie', col)) return;
    col.appendChild(soloCep('ul', 'ep-redes-pie',
      '<li><a href="https://www.facebook.com/profile.php?id=100072377182191" rel="noopener">Facebook</a></li>' +
      '<li><a href="https://x.com/EstPublicos" rel="noopener">X · @EstPublicos</a></li>' +
      '<li><a href="https://www.instagram.com/estudiospublicos/" rel="noopener">Instagram</a></li>'));
  })();

  // (el estilo CEP queda como prueba aparte: ?estilo=cep)
})();

/* 11. Portada: índice del último número junto a su tapa.
   Lee la página del número (misma dirección del botón «Ver más») y muestra
   artículos y notas con autores; las reseñas, como un conteo. */
(function () {
  'use strict';
  var caja = document.querySelector('#home .section-last-number .contentUltimoNumero');
  var boton = caja && caja.querySelector('a.suscribete');
  if (!boton || caja.querySelector('.ep-indice')) return;
  var url = boton.getAttribute('href');
  var limpio = function (t) { return (t || '').replace(/\s+/g, ' ').trim(); };
  var esc = function (t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
  fetch(url, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
    if (!html) return;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var secciones = [];
    Array.prototype.forEach.call(doc.querySelectorAll('#single-numero h3.title'), function (h3) {
      var sec = h3.closest('.section') || h3.parentNode;
      var items = Array.prototype.filter.call(sec.querySelectorAll('.caja-articulo-listado'), function (c) {
        return !c.closest('.slick-cloned') && c.querySelector('h4');
      }).map(function (c) {
        var a = c.querySelector('a[href*="article/view"]');
        return {
          titulo: limpio(c.querySelector('h4').textContent),
          url: a ? a.getAttribute('href') : url,
          autores: Array.prototype.map.call(c.querySelectorAll('.autor .name'), function (n) { return limpio(n.textContent).replace(/,$/, ''); }).join(', ')
        };
      });
      if (items.length) secciones.push({ nombre: limpio(h3.textContent), items: items });
    });
    if (!secciones.length) return;
    var partes = [], resto = [];
    secciones.forEach(function (s) {
      if (/rese/i.test(s.nombre)) { resto.push(s.items.length + ' ' + (s.items.length === 1 ? 'reseña' : 'reseñas')); return; }
      partes.push('<li class="ep-indice__sec">' + esc(s.nombre) + '</li>' + s.items.map(function (it) {
        return '<li><a href="' + it.url + '"><b>' + esc(it.titulo) + '</b><span>' + esc(it.autores) + '</span></a></li>';
      }).join(''));
    });
    var div = document.createElement('div');
    div.className = 'ep-indice';
    div.innerHTML = '<p class="ep-indice__titulo">En este número</p><ul>' + partes.join('') + '</ul>' +
      (resto.length ? '<p class="ep-indice__mas">Además, ' + resto.join(' y ') + '.</p>' : '');
    caja.insertBefore(div, boton.closest('.botton-group') || boton);
    caja.closest('.last-number').classList.add('ep-con-indice');
  }).catch(function () {});
})();


/* 13. Barra lateral: las fuentes del número actual como enlaces de texto */
(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('.sidebar.desktop-sidebar .actual .info a'), function (a) {
    var h = a.getAttribute('href') || '';
    var n = /atom/i.test(h) ? 'Atom' : /rss2/i.test(h) ? 'RSS 2.0' : /rss/i.test(h) ? 'RSS 1.0' : '';
    if (!n) return;
    a.classList.add('ep-rss'); a.setAttribute('data-nombre', n); a.setAttribute('aria-label', 'Fuente ' + n + ' del número actual');
  });
})();

/* 15. Archivo de números: los 185 números en una sola página, con filtro por
   década y dos vistas (tapas o lista por año). Lee las páginas del archivo
   (1 a 8) y arma la grilla; si algo falla, queda el archivo paginado de siempre. */
(function () {
  'use strict';
  var m = location.pathname.match(/^(.*\/issue\/archive)(?:\/(\d+))?\/?$/);
  var caja = document.querySelector('.container.archives .box-other-numbers');
  if (!m || !caja) return;
  var base = m[1];
  var nPag = document.querySelectorAll('.cmp_pagination .content__pages ul li').length || 1;
  var limpio = function (t) { return (t || '').replace(/\s+/g, ' ').trim(); };
  var esc = function (t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
  function leer(doc) {
    return Array.prototype.map.call(doc.querySelectorAll('.container.archives .box-other-numbers a.link'), function (a) {
      var img = a.querySelector('img');
      return {
        url: a.getAttribute('href'),
        num: (function (t) {
          // 001, 002… son números especiales; 01 es el volumen Online First
          var d = (t.match(/(\d+)\s*$/) || [])[1] || '';
          if (/^00\d$/.test(d)) return 'Especial ' + parseInt(d, 10);
          if (/^0\d$/.test(d)) return 'Online First';
          return t;
        })(limpio((a.querySelector('.number') || {}).textContent)),
        anio: parseInt(limpio((a.querySelector('.year') || {}).textContent), 10) || 0,
        tapa: img ? img.getAttribute('src').trim() : ''
      };
    });
  }
  var paginas = [];
  for (var i = 1; i <= nPag; i++) paginas.push(i);
  Promise.all(paginas.map(function (k) {
    var copia = location.pathname.indexOf('/ep-prueba/') === 0;
    var dir = k === 1 ? base + (copia ? '/' : '') : base + '/' + k + (copia ? '/' : '');
    return fetch(dir, { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (h) { return h ? leer(new DOMParser().parseFromString(h, 'text/html')) : []; })
      .catch(function () { return []; });
  })).then(function (listas) {
    var vistos = {}, todos = [];
    listas.forEach(function (l) { l.forEach(function (n) { if (!vistos[n.url]) { vistos[n.url] = 1; todos.push(n); } }); });
    if (todos.length < 30) return;
    // los números especiales (001, 002…) quedan en su año, no al final
    todos = todos.map(function (n, i) { n.i = i; return n; }).sort(function (a, b) { return (b.anio - a.anio) || (a.i - b.i); });
    var decadas = [];
    todos.forEach(function (n) { var d = Math.floor(n.anio / 10) * 10; if (n.anio && decadas.indexOf(d) < 0) decadas.push(d); });
    decadas.sort(function (a, b) { return b - a; });
    var estado = { decada: decadas[0], vista: 'tapas' };
    var raiz = document.createElement('div');
    raiz.className = 'ep-archivo';
    raiz.innerHTML =
      '<div class="ep-archivo__barra">' +
        '<div class="ep-archivo__decadas" role="group" aria-label="Década">' +
          decadas.map(function (d) { return '<button type="button" data-decada="' + d + '">' + d + 's</button>'; }).join('') +
          '<button type="button" data-decada="todas">Todos</button>' +
        '</div>' +
        '<div class="ep-archivo__vistas" role="group" aria-label="Vista">' +
          '<button type="button" data-vista="tapas">Tapas</button><button type="button" data-vista="lista">Lista</button>' +
        '</div>' +
        '<p class="ep-archivo__cuenta" aria-live="polite"></p>' +
      '</div><div class="ep-archivo__cuerpo"></div>';
    var cuerpo = raiz.querySelector('.ep-archivo__cuerpo');
    function pintar() {
      var sel = todos.filter(function (n) { return estado.decada === 'todas' || Math.floor(n.anio / 10) * 10 === estado.decada; });
      Array.prototype.forEach.call(raiz.querySelectorAll('[data-decada]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-decada') === String(estado.decada))); });
      Array.prototype.forEach.call(raiz.querySelectorAll('[data-vista]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-vista') === estado.vista)); });
      raiz.querySelector('.ep-archivo__cuenta').textContent = sel.length + (sel.length === 1 ? ' número' : ' números');
      if (estado.vista === 'tapas') {
        cuerpo.className = 'ep-archivo__cuerpo ep-archivo__tapas';
        cuerpo.innerHTML = sel.map(function (n, i) {
          return '<a href="' + n.url + '"><img ' + (i > 17 ? 'loading="lazy" ' : '') + 'alt="" src="' + n.tapa + '"><b>' + esc(n.num) + '</b><span>' + n.anio + '</span></a>';
        }).join('');
      } else {
        var porAnio = {};
        sel.forEach(function (n) { (porAnio[n.anio] = porAnio[n.anio] || []).push(n); });
        cuerpo.className = 'ep-archivo__cuerpo ep-archivo__lista';
        cuerpo.innerHTML = Object.keys(porAnio).sort(function (a, b) { return b - a; }).map(function (a) {
          return '<div class="ep-archivo__anio"><b>' + a + '</b><div>' + porAnio[a].map(function (n) {
            return '<a href="' + n.url + '">' + esc(n.num) + '</a>';
          }).join('') + '</div></div>';
        }).join('');
      }
    }
    raiz.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-decada')) { var d = b.getAttribute('data-decada'); estado.decada = d === 'todas' ? 'todas' : parseInt(d, 10); }
      if (b.hasAttribute('data-vista')) estado.vista = b.getAttribute('data-vista');
      pintar();
    });
    caja.parentNode.insertBefore(raiz, caja);
    document.documentElement.classList.add('ep-archivo-listo');
    pintar();
  });
})();
/* 16. Artículo: botón «Cómo citar» junto al PDF (copia la cita) y, al final,
   los otros textos del mismo número (leídos de la página del número). */
(function () {
  'use strict';
  var art = document.querySelector('#single-numero.article-details');
  if (!art) return;
  var limpio = function (t) { return (t || '').replace(/\s+/g, ' ').trim(); };
  var esc = function (t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; };

  // Cómo citar
  var cita = art.querySelector('.item.citation');
  var entrada = art.querySelector('.csl-entry .csl-right-inline') || art.querySelector('.csl-entry');
  var opciones = art.querySelector('.headerBanner .options');
  if (cita && entrada && opciones && !opciones.querySelector('.ep-citar')) {
    cita.id = cita.id || 'ep-cita';
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ep-citar';
    b.textContent = 'Cómo citar';
    b.addEventListener('click', function () {
      var texto = limpio(entrada.textContent);
      var listo = function () {
        b.textContent = 'Cita copiada';
        b.classList.add('ep-citar--ok');
        setTimeout(function () { b.textContent = 'Cómo citar'; b.classList.remove('ep-citar--ok'); }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(listo, function () { cita.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
      } else {
        cita.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    opciones.appendChild(b);
  }

  // Otros textos del número
  var volver = art.querySelector('.volume-back');
  var url = volver && volver.getAttribute('data-href');
  var destino = art.querySelector('.section-sidebar .section-article');
  if (!url || !destino || destino.querySelector('.ep-otros')) return;
  var propio = (location.pathname.match(/article\/view\/(\d+)/) || [])[1];
  fetch(url, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
    if (!html) return;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var titulo = limpio((doc.querySelector('.title-right-box .title1') || {}).textContent);
    var grupos = [];
    Array.prototype.forEach.call(doc.querySelectorAll('#single-numero h3.title'), function (h3) {
      var sec = h3.closest('.section') || h3.parentNode;
      var items = Array.prototype.filter.call(sec.querySelectorAll('.caja-articulo-listado'), function (c) {
        return !c.closest('.slick-cloned') && c.querySelector('h4');
      }).map(function (c) {
        var a = c.querySelector('a[href*="article/view"]');
        var href = a ? a.getAttribute('href') : '';
        return {
          id: (href.match(/article\/view\/(\d+)/) || [])[1],
          url: href,
          titulo: limpio(c.querySelector('h4').textContent),
          autores: Array.prototype.map.call(c.querySelectorAll('.autor .name'), function (n) { return limpio(n.textContent).replace(/,$/, ''); }).join(', ')
        };
      }).filter(function (it) { return it.url && it.id !== propio; });
      if (items.length) grupos.push({ nombre: limpio(h3.textContent), items: items });
    });
    if (!grupos.length) return;
    var div = document.createElement('div');
    div.className = 'ep-otros';
    div.innerHTML = '<h3>Otros textos ' + (titulo ? 'del ' + esc(titulo.replace(/^Número\s*/i, 'N° ')) : 'de este número') + '</h3>' +
      grupos.map(function (g) {
        return '<p class="ep-otros__sec">' + esc(g.nombre) + '</p><ul>' + g.items.map(function (it) {
          return '<li><a href="' + it.url + '"><b>' + esc(it.titulo) + '</b><span>' + esc(it.autores) + '</span></a></li>';
        }).join('') + '</ul>';
      }).join('') +
      '<a class="ep-otros__todo" href="' + url + '">Ver el número completo</a>';
    destino.appendChild(div);
  }).catch(function () {});
})();
/* ===== EP CAPA DE CAMBIOS: FIN ===== */
