/*
 * Capa de cambios de c22cepchile.cl: comportamiento (JS).
 *
 * Va en el <head> (WPCode: «Site Wide Header»). Marca el <body> apenas el
 * navegador lo crea, antes de dibujar nada, y rearma la página cuando termina
 * de cargar; así no se alcanza a ver la versión anterior.
 * Cada bloque es independiente: si uno falla, los demás siguen.
 */
(function () {
  'use strict';
  // Modo de prueba: con true, los cambios solo se ven con la sesión de
  // WordPress iniciada (el <body> trae la clase «logged-in»). Para
  // publicarlos a todos, cambiar a false.
  var SOLO_EDITORES = true;
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var DIA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var $ = window.jQuery;
  var activo = null, cola = [];

  // 1) apenas existe el <body>: decidir si se aplican los cambios y marcarlo
  function alBody(fn) {
    if (document.body) return fn();
    var mo = new MutationObserver(function () { if (document.body) { mo.disconnect(); fn(); } });
    mo.observe(document.documentElement, { childList: true });
  }
  alBody(function () {
    activo = !(SOLO_EDITORES && !document.body.classList.contains('logged-in'));
    // todo el CSS de la versión para WordPress cuelga de .c22-cambios
    document.body.classList.add(activo ? 'c22-cambios' : 'c22-listo');
    if (activo) cola.forEach(programar);
    cola = null;
  });

  // 2) cada bloque corre cuando la página terminó de cargar, después de los
  //    $(document).ready del tema, que arman los carruseles
  function programar(fn) {
    function go() {
      $ = window.jQuery;
      if ($) $(function () { setTimeout(fn, 0); }); else fn();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
  function ready(fn) {
    if (cola) cola.push(fn);       // todavía no hay <body>: se programa al decidir
    else if (activo) programar(fn);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function txt(html) { var d = document.createElement('textarea'); d.innerHTML = html || ''; return d.value; }

  /* ===== C22 portada: banner con lo último de cada serie ===== */
  // Reemplaza el banner de la foto recortada. Toma la tarjeta más reciente de
  // Revisa, Analiza, Lee y Mira (las mismas que ya trae la portada: foto,
  // número de serie, autores y fecha), las ordena de la más nueva a la más
  // antigua y las hace rotar con fundido, como el destacado del CEP.
  // Se actualiza solo: cada publicación nueva entra al banner sin tocar nada.
  var SERIES = {
    revisa: ['Puntos de Referencia', 'pdr', 'publicaciones'],
    analiza: ['Análisis online', 'ana', 'analisis'],
    lee: ['Notas de investigación', 'not', 'publicaciones'],
    mira: ['Columnas', 'col', 'publicaciones']
  };
  function fechaDe(el) {
    var m = el && /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(el.getAttribute('title') || el.textContent);
    return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
  }
  function lista(xs) { return xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1]; }
  ready(function () {
    if (!document.body.classList.contains('home')) return;
    var hero = document.querySelector('main > section.slider-1');
    if (!hero) return;
    var items = [];
    Object.keys(SERIES).forEach(function (id) {
      var card = document.querySelector('#' + id + ' a.card:not(.slick-cloned)');
      if (!card) return;
      var pc = card.querySelector('.photo-container'), img = card.querySelector('img.photo');
      var num = pc ? getComputedStyle(pc, '::after').content : '';
      num = /^["']/.test(num || '') ? num.slice(1, -1) : '';
      var src = img && (img.getAttribute('src') || '').trim();
      items.push({
        s: SERIES[id], link: card.getAttribute('href'), num: num, img: src || '',
        title: (card.querySelector('.title') || card).textContent.trim(),
        date: fechaDe(card.querySelector('.date')),
        names: [].map.call(card.querySelectorAll('.names li'), function (li) { return li.textContent.trim(); })
      });
    });
    if (items.length < 2) return;
    items.sort(function (a, b) { return (b.date || 0) - (a.date || 0); });

    var lema = (hero.querySelector('.slick-slide:not(.slick-cloned) .title') || {}).textContent || 'Aprender de Chile con métodos digitales';
    var n = items.length;
    var slides = items.map(function (it, i) {
      var f = it.date ? it.date.getDate() + ' ' + MES[it.date.getMonth()] + ' ' + it.date.getFullYear() : '';
      return '<article class="c22-slide s-' + it.s[1] + (i ? '' : ' is-on') + '" role="group" aria-roledescription="diapositiva" aria-label="' + (i + 1) + ' de ' + n + '"' + (i ? ' aria-hidden="true" inert' : '') + '>' +
        '<a class="c22-slide__img' + (it.img ? '' : ' sin-foto') + '" href="' + esc(it.link) + '" tabindex="-1" aria-hidden="true">' +
        (it.img ? '<img src="' + esc(it.img) + '" alt=""' + (i ? ' loading="lazy"' : '') + '>' : '') +
        '<span class="c22-slide__num">' + esc(it.num) + '<small>' + esc(it.s[0].toLowerCase()) + '</small></span></a>' +
        '<div class="c22-slide__txt"><p class="c22-slide__serie">' + esc(it.s[0]) + (f ? ' <span>· ' + f + '</span>' : '') + '</p>' +
        '<h2><a href="' + esc(it.link) + '">' + esc(it.title) + '</a></h2><p class="c22-slide__resumen"></p>' +
        (it.names.length ? '<p class="c22-slide__autores">' + esc(lista(it.names)) + '</p>' : '') +
        '<a class="c22-slide__btn" href="' + esc(it.link) + '">Leer</a></div></article>';
    }).join('');
    var sec = document.createElement('section');
    sec.className = 'c22-banner';
    sec.setAttribute('aria-roledescription', 'carrusel');
    sec.setAttribute('aria-label', 'Lo último de C22');
    sec.innerHTML = '<h1 class="c22-banner__lema">' + esc(lema.trim()) + '</h1><div class="c22-banner__slides">' + slides +
      '<div class="c22-banner__ctl"><button type="button" class="prev" aria-label="Anterior">‹</button><span class="dots"></span>' +
      '<button type="button" class="next" aria-label="Siguiente">›</button><button type="button" class="pause">Pausar</button></div></div>';
    hero.parentNode.insertBefore(sec, hero);
    try { if ($ && $.fn.slick && $(hero).hasClass('slick-initialized')) $(hero).slick('unslick'); } catch (e) {}
    document.body.classList.add('c22-sin-banner');

    // rotación: 7 s, se detiene con el mouse encima, con el foco dentro o con el botón (WCAG 2.2.2)
    var arts = [].slice.call(sec.querySelectorAll('.c22-slide')), dots = sec.querySelector('.dots'), btn = sec.querySelector('.pause');
    var cur = 0, paused = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, hover = false, timer;
    arts.forEach(function (a, k) {
      var d = document.createElement('button');
      d.type = 'button'; d.className = 'dot s-' + items[k].s[1]; d.setAttribute('aria-label', 'Ver ' + (k + 1) + ' de ' + n);
      d.addEventListener('click', function () { show(k); });
      dots.appendChild(d);
    });
    function show(k) {
      cur = (k + n) % n;
      arts.forEach(function (a, j) {
        a.classList.toggle('is-on', j === cur);
        if (j === cur) { a.removeAttribute('aria-hidden'); a.removeAttribute('inert'); } else { a.setAttribute('aria-hidden', 'true'); a.setAttribute('inert', ''); }
      });
      [].forEach.call(dots.children, function (d, j) { d.setAttribute('aria-current', j === cur ? 'true' : 'false'); });
    }
    function setPaused(p) { paused = p; btn.textContent = p ? 'Reanudar' : 'Pausar'; btn.setAttribute('aria-pressed', p ? 'true' : 'false'); }
    sec.querySelector('.prev').addEventListener('click', function () { show(cur - 1); });
    sec.querySelector('.next').addEventListener('click', function () { show(cur + 1); });
    btn.addEventListener('click', function () { setPaused(!paused); });
    sec.addEventListener('mouseenter', function () { hover = true; });
    sec.addEventListener('mouseleave', function () { hover = false; });
    sec.addEventListener('focusin', function () { hover = true; });
    sec.addEventListener('focusout', function () { hover = false; });
    setPaused(paused);
    show(0);
    timer = setInterval(function () { if (!paused && !hover && !document.hidden) show(cur + 1); }, 7000);

    // resumen: primer párrafo del texto de cada publicación. La API del sitio
    // no trae el cuerpo (vive en campos ACF), así que se lee de la propia
    // página, y solo cuando su diapositiva aparece.
    var pedidos = {};
    function resumen(k) {
      if (pedidos[k] || !window.fetch || !window.DOMParser) return;
      pedidos[k] = 1;
      fetch(items[k].link, { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var p = [].map.call(doc.querySelectorAll('article .wysiwyg p, section.wysiwyg p'), function (x) { return x.textContent.replace(/\s+/g, ' ').trim(); })
            .filter(function (t) { return t.length > 80; })[0];
          if (!p) return;
          if (p.length > 260) p = p.slice(0, 260).replace(/\s+\S*$/, '') + '…';
          arts[k].querySelector('.c22-slide__resumen').textContent = p;
        }).catch(function () {});
    }
    var show0 = show;
    show = function (k) { show0(k); resumen(cur); resumen((cur + 1) % n); };
    resumen(0); resumen(1 % n);
  });

  /* ===== C22 portada: cada sección muestra sus cuatro tarjetas ===== */
  ready(function () {
    if (!document.body.classList.contains('home')) return;
    // en el teléfono se deja el carrusel original: en dos columnas no caben los títulos
    if (window.matchMedia && matchMedia('(max-width: 760px)').matches) return;
    document.querySelectorAll('main section.cards-slider').forEach(function (sec) {
      if (sec.id === 'comparte' || sec.classList.contains('slider-testimonials')) return;
      var car = sec.querySelector('.carrousel-slider');
      if (!car) return;
      try { if ($ && $.fn.slick && $(car).hasClass('slick-initialized')) $(car).slick('unslick'); } catch (e) { return; }
      car.querySelectorAll('.fake-card').forEach(function (f) { f.remove(); });
      car.style.setProperty('--c22-n', Math.min(5, car.querySelectorAll(':scope > a.card').length) || 4);
      sec.classList.add('c22-grid');
    });
  });

  function norm(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  /* ===== C22 publicaciones: cada serie muestra sus cuatro más recientes ===== */
  ready(function () {
    if (!document.body.classList.contains('page-template-plantilla-publicaciones')) return;
    if (window.matchMedia && matchMedia('(max-width: 760px)').matches) return;
    document.querySelectorAll('.categories-tabs .tab-content > .slider').forEach(function (sl) {
      try { if ($ && $.fn.slick && $(sl).hasClass('slick-initialized')) $(sl).slick('unslick'); } catch (e) { return; }
      sl.classList.add('c22-grid4');
    });
  });

  /* ===== C22 sobre C22: catálogo con filtros, buscador y «Mostrar más» ===== */
  ready(function () {
    var cat = document.querySelector('.c22cat');
    if (!cat) return;
    var POR_SERIE = 6, PASO = 12;
    var series = [].map.call(cat.querySelectorAll('h3.c22cat-serie'), function (h) {
      var ol = h.nextElementSibling;
      if (!ol || ol.tagName !== 'OL') return null;
      var items = [].slice.call(ol.children);
      items.forEach(function (li) { li._t = norm(li.textContent); });
      return { h: h, ol: ol, items: items, name: (h.firstChild.textContent || '').trim(), lim: POR_SERIE };
    }).filter(Boolean);
    if (!series.length) return;
    var total = series.reduce(function (a, s) { return a + s.items.length; }, 0);
    var sel = -1, q = '';
    var bar = document.createElement('div');
    bar.className = 'c22cat-barra';
    bar.innerHTML = '<div class="chips" role="group" aria-label="Filtrar por serie"><button type="button" data-i="-1" aria-pressed="true">Todas<span>' + total + '</span></button>' +
      series.map(function (s, i) { return '<button type="button" data-i="' + i + '" aria-pressed="false">' + esc(s.name) + '<span>' + s.items.length + '</span></button>'; }).join('') +
      '</div><input type="search" placeholder="Buscar por título, autor o año" aria-label="Buscar en el catálogo"><p class="c22cat-cuenta" aria-live="polite"></p>';
    cat.parentNode.insertBefore(bar, cat);
    series.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'c22cat-mas';
      b.addEventListener('click', function () { s.lim += PASO; render(); });
      s.ol.parentNode.insertBefore(b, s.ol.nextSibling);
      s.mas = b;
    });
    function render() {
      var shown = 0;
      series.forEach(function (s, i) {
        var on = sel === -1 || sel === i, m = 0, v = 0;
        s.items.forEach(function (li) {
          var hit = !q || li._t.indexOf(q) >= 0;
          if (hit) m++;
          var show = on && hit && (q || m <= s.lim);
          li.hidden = !show;
          if (show) v++;
        });
        s.h.hidden = s.ol.hidden = !on || (q && !m);
        var rest = m - s.lim;
        s.mas.hidden = !on || !!q || rest <= 0;
        s.mas.textContent = 'Mostrar más ' + s.name.toLowerCase() + ' (' + Math.max(rest, 0) + ')';
        shown += v;
      });
      bar.querySelector('.c22cat-cuenta').textContent = q ? shown + (shown === 1 ? ' resultado' : ' resultados') : 'Mostrando ' + shown + ' de ' + total + ' publicaciones';
    }
    bar.querySelectorAll('.chips button').forEach(function (b) {
      b.addEventListener('click', function () {
        sel = +b.getAttribute('data-i');
        bar.querySelectorAll('.chips button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        series.forEach(function (s, i) { s.lim = sel === i ? 20 : POR_SERIE; });
        render();
      });
    });
    bar.querySelector('input').addEventListener('input', function (e) { q = norm(e.target.value.trim()); render(); });
    render();
  });

  /* ===== C22 personas: directorio como el Equipo del CEP ===== */
  // Grupos con su nombre a la izquierda y personas en filas (foto redonda,
  // nombre, cargo, formación), buscador y filtro actual/histórico. Se mueven las
  // fichas originales, así cada una sigue abriendo su perfil.
  var GRUPOS = [
    ['Dirección y coordinación', /director|coordina/i, 'g-dir'],
    ['Investigadores', /investigador|editora/i, 'g-inv', /asistente/i],
    ['Asistentes de investigación', /asistente/i, 'g-asi'],
    ['Práctica y pasantías', /pasant|pr[aá]ctic/i, 'g-pas']
  ];
  ready(function () {
    if (!document.body.classList.contains('page-template-plantilla-personas')) return;
    var lists = document.querySelectorAll('main .alm-listing');
    if (!lists.length) return;
    var actuales = [].slice.call(lists[0].querySelectorAll(':scope > .person'));
    var historicos = lists[1] ? [].slice.call(lists[1].querySelectorAll(':scope > .person')) : [];
    if (!actuales.length) return;
    function fila(p, hist) {
      p.classList.add('c22-p');
      if (hist) p.classList.add('c22-p-hist');
      p._t = norm(p.textContent);
      if (!p.querySelector('.photo-container')) {  // sin foto: círculo con iniciales
        var nom = (p.querySelector('.title') || p).textContent.trim().split(/\s+/);
        var ini = document.createElement('div');
        ini.className = 'photo-container c22-ini';
        ini.setAttribute('aria-hidden', 'true');
        ini.textContent = (nom[0] || '').charAt(0) + (nom.length > 1 ? nom[nom.length - 1].charAt(0) : '');
        p.insertBefore(ini, p.firstChild);
      }
      var rol = p.querySelector('.rol');
      p._rol = rol ? rol.textContent.trim() : '';
      return p;
    }
    var grupos = GRUPOS.map(function (g) { return { name: g[0], cls: g[2], rx: g[1], no: g[3], people: [] }; });
    actuales.forEach(function (p) {
      fila(p, false);
      var g = grupos.filter(function (g) { return g.rx.test(p._rol) && !(g.no && g.no.test(p._rol)); })[0] || grupos[1];
      g.people.push(p);
    });
    grupos = grupos.filter(function (g) { return g.people.length; });
    if (historicos.length) grupos.push({ name: 'Equipo histórico', cls: 'g-his', people: historicos.map(function (p) { return fila(p, true); }), hist: true });

    var total = actuales.length + historicos.length;
    var dir = document.createElement('div');
    dir.className = 'c22-dir';
    dir.innerHTML = '<div class="c22-dir__tools"><input type="search" placeholder="Buscar por nombre, formación o cargo" aria-label="Buscar personas">' +
      '<div class="chips" role="group" aria-label="Filtrar"><button type="button" data-f="" aria-pressed="true">Todos</button>' +
      '<button type="button" data-f="act" aria-pressed="false">Equipo actual <span>' + actuales.length + '</span></button>' +
      (historicos.length ? '<button type="button" data-f="his" aria-pressed="false">Equipo histórico <span>' + historicos.length + '</span></button>' : '') +
      '</div></div><p class="c22-dir__count" aria-live="polite"></p>';
    grupos.forEach(function (g) {
      var sec = document.createElement('section');
      sec.className = 'c22-dir__grupo ' + g.cls;
      sec.innerHTML = '<h2>' + esc(g.name) + '</h2><div class="c22-dir__people"></div>';
      var box = sec.querySelector('.c22-dir__people');
      g.people.forEach(function (p) { box.appendChild(p); });
      g.sec = sec;
      dir.appendChild(sec);
    });
    var wrap = lists[0].closest('.ajax-load-more-wrap') || lists[0];
    wrap.parentNode.insertBefore(dir, wrap);
    document.body.classList.add('c22-directorio');

    var input = dir.querySelector('input'), count = dir.querySelector('.c22-dir__count'), filtro = '';
    function render() {
      var q = norm(input.value.trim()), n = 0;
      grupos.forEach(function (g) {
        var vis = 0, on = !filtro || (filtro === 'his') === !!g.hist;
        g.people.forEach(function (p) { var hit = on && (!q || p._t.indexOf(q) >= 0); p.hidden = !hit; if (hit) vis++; });
        g.sec.hidden = !vis;
        n += vis;
      });
      count.textContent = n === total ? total + ' personas' : n + ' de ' + total + ' personas';
    }
    input.addEventListener('input', render);
    dir.querySelectorAll('.chips button').forEach(function (b) {
      b.addEventListener('click', function () {
        filtro = b.getAttribute('data-f');
        dir.querySelectorAll('.chips button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        render();
      });
    });
    render();
  });

  /* ===== C22 fechas legibles: 13/07/2026 → 13 jul 2026 ===== */
  var FECHA = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/;
  function fechas(root) {
    (root || document).querySelectorAll('.date, .card-news .date, .single-header .date').forEach(function (el) {
      if (el.children.length) return;
      var m = FECHA.exec(el.textContent);
      if (!m) return;
      el.setAttribute('title', el.textContent.trim());
      el.textContent = +m[1] + ' ' + MES[+m[2] - 1] + ' ' + m[3];
    });
  }
  ready(function () {
    fechas();
    // Ajax Load More agrega tarjetas después de cargar la página
    if (window.MutationObserver) new MutationObserver(function () { fechas(); }).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  });

  /* ===== C22 carga sin parpadeo: listo ===== */
  // último en la cola: cuando todo lo anterior ya rearmó la página, se muestra
  ready(function () { document.body.classList.add('c22-listo'); });
})();
