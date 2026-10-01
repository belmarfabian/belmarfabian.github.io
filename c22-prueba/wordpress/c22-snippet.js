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

  /* ===== C22 portada: destacados — uno grande y tres chicos ===== */
  // Reemplaza el banner de la foto recortada. Toma la tarjeta más reciente de
  // Revisa, Analiza, Lee y Mira (las mismas que ya trae la portada: foto,
  // número de serie, autores y fecha). La más reciente va en grande y las
  // otras tres en chico. Se actualiza solo con cada publicación nueva.
  // DISENO: 'b' grande + fila (elegido) · 'a' grande + columna · 'c' grande que rota.
  var DISENO = 'b';
  try { var qd = /[?&]diseno=([abc])/.exec(location.search); if (qd) DISENO = qd[1]; } catch (e) {}
  var SERIES = {
    revisa: ['Puntos de Referencia', 'pdr'],
    analiza: ['Análisis online', 'ana'],
    lee: ['Notas de investigación', 'not'],
    mira: ['Columnas', 'col']
  };
  // Imágenes que conviene reemplazar mientras se cambian en WordPress
  // (imagen destacada de la publicación).
  var IMAGENES = {
    'monitor-legislativo-las-votaciones-del-congreso-en-visualizaciones':
      'https://static.cepchile.cl/uploads/c22/2026/08/16-054150_bp5j_c22-congreso-nacional.jpg'
  };
  function imagenDe(link) {
    for (var k in IMAGENES) if (link.indexOf(k) >= 0) return IMAGENES[k];
    return '';
  }
  ready(function () {  // la tarjeta del Monitor en Analiza, con la misma foto
    Object.keys(IMAGENES).forEach(function (k) {
      document.querySelectorAll('a.card[href*="' + k + '"] img.photo').forEach(function (i) { i.src = IMAGENES[k]; i.removeAttribute('srcset'); });
    });
  });
  function fechaDe(el) {
    var m = el && /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(el.getAttribute('title') || el.textContent);
    return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
  }
  function fechaTxt(d) { return d ? d.getDate() + ' ' + MES[d.getMonth()] + ' ' + d.getFullYear() : ''; }
  function lista(xs) { return xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1]; }
  function resumenDe(link, cb) {
    if (!window.fetch || !window.DOMParser) return;
    fetch(link, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var p = [].map.call(doc.querySelectorAll('article .wysiwyg p, section.wysiwyg p'), function (x) { return x.textContent.replace(/\s+/g, ' ').trim(); })
        .filter(function (t) { return t.length > 80; })[0];
      if (!p) return;
      cb(p.length > 280 ? p.slice(0, 280).replace(/\s+\S*$/, '') + '…' : p);
    }).catch(function () {});
  }
  function imgHtml(it, cls, lazy) {
    return '<a class="' + cls + (it.img ? '' : ' sin-foto') + ' s-' + it.s[1] + '" href="' + esc(it.link) + '" tabindex="-1" aria-hidden="true">' +
      (it.img ? '<img src="' + esc(it.img) + '" alt=""' + (lazy ? ' loading="lazy"' : '') + '>' : '') +
      '<span class="c22-num">' + esc(it.num) + '<small>' + esc(it.s[0].toLowerCase()) + '</small></span></a>';
  }
  function grande(it, extra) {
    return '<article class="c22-dest__big s-' + it.s[1] + '"' + (extra || '') + '>' + imgHtml(it, 'c22-dest__img', false) +
      '<div class="c22-dest__txt"><p class="c22-dest__serie">' + esc(it.s[0]) + (it.date ? ' <span>· ' + fechaTxt(it.date) + '</span>' : '') + '</p>' +
      '<h2><a href="' + esc(it.link) + '">' + esc(it.title) + '</a></h2><p class="c22-dest__resumen"></p>' +
      (it.names.length ? '<p class="c22-dest__autores">' + esc(lista(it.names)) + '</p>' : '') +
      '<a class="c22-dest__btn" href="' + esc(it.link) + '">Leer</a></div></article>';
  }
  function chico(it, k) {
    return '<article class="c22-dest__small s-' + it.s[1] + '" data-k="' + k + '">' + imgHtml(it, 'c22-dest__thumb', true) +
      '<div><p class="c22-dest__serie">' + esc(it.s[0]) + (it.date ? ' <span>· ' + fechaTxt(it.date) + '</span>' : '') + '</p>' +
      '<h3><a href="' + esc(it.link) + '">' + esc(it.title) + '</a></h3></div></article>';
  }
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
      var link = card.getAttribute('href');
      items.push({
        s: SERIES[id], link: link, num: num,
        img: imagenDe(link) || (img && (img.getAttribute('src') || '').trim()) || '',
        title: (card.querySelector('.title') || card).textContent.trim(),
        date: fechaDe(card.querySelector('.date')),
        names: [].map.call(card.querySelectorAll('.names li'), function (li) { return li.textContent.trim(); })
      });
    });
    if (items.length < 2) return;
    items.sort(function (a, b) { return (b.date || 0) - (a.date || 0); });

    var sec = document.createElement('section');
    sec.className = 'c22-dest c22-dest--' + DISENO;
    sec.setAttribute('aria-label', 'Lo último de C22');
    if (DISENO === 'c') {
      sec.setAttribute('aria-roledescription', 'carrusel');
      sec.innerHTML = '<div class="c22-dest__stage">' + items.map(function (it, k) {
        return grande(it, ' role="group" aria-roledescription="diapositiva" aria-label="' + (k + 1) + ' de ' + items.length + '"');
      }).join('') + '</div><div class="c22-dest__side"></div>' +
        '<button type="button" class="c22-dest__pause">Pausar</button>';
    } else {
      sec.innerHTML = grande(items[0]) + '<div class="c22-dest__side">' + items.slice(1, 4).map(chico).join('') + '</div>';
    }
    hero.parentNode.insertBefore(sec, hero);
    try { if ($ && $.fn.slick && $(hero).hasClass('slick-initialized')) $(hero).slick('unslick'); } catch (e) {}
    document.body.classList.add('c22-sin-banner');
    // mismo ancho que la barra de colores y las secciones de abajo
    var barra = document.querySelector('main > ul.sticky-header');
    function alinear() { if (barra && barra.offsetWidth) sec.style.maxWidth = barra.offsetWidth + 'px'; }
    alinear(); window.addEventListener('resize', alinear);

    var bigs = [].slice.call(sec.querySelectorAll('.c22-dest__big'));
    var pedidos = {};
    function resumen(k) {
      if (pedidos[k]) return; pedidos[k] = 1;
      resumenDe(items[k].link, function (t) { bigs[DISENO === 'c' ? k : 0].querySelector('.c22-dest__resumen').textContent = t; });
    }
    if (DISENO !== 'c') { resumen(0); return; }

    // diseño c: el grande rota (8 s, fundido) y al lado quedan los otros tres;
    // al hacer clic en uno chico pasa a grande. Pausa con mouse, foco o botón.
    var side = sec.querySelector('.c22-dest__side'), btn = sec.querySelector('.c22-dest__pause');
    var cur = 0, hover = false, paused = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function show(k) {
      cur = (k + items.length) % items.length;
      bigs.forEach(function (a, j) {
        a.classList.toggle('is-on', j === cur);
        if (j === cur) { a.removeAttribute('aria-hidden'); a.removeAttribute('inert'); } else { a.setAttribute('aria-hidden', 'true'); a.setAttribute('inert', ''); }
      });
      side.innerHTML = items.map(function (it, j) { return j === cur ? '' : chico(it, j); }).join('');
      resumen(cur); resumen((cur + 1) % items.length);
    }
    side.addEventListener('click', function (e) {
      var art = e.target.closest('.c22-dest__small');
      if (!art || e.target.closest('h3 a')) return;
      e.preventDefault(); show(+art.getAttribute('data-k'));
    });
    function setPaused(p) { paused = p; btn.textContent = p ? 'Reanudar' : 'Pausar'; btn.setAttribute('aria-pressed', p ? 'true' : 'false'); }
    btn.addEventListener('click', function () { setPaused(!paused); });
    sec.addEventListener('mouseenter', function () { hover = true; });
    sec.addEventListener('mouseleave', function () { hover = false; });
    sec.addEventListener('focusin', function () { hover = true; });
    sec.addEventListener('focusout', function () { hover = false; });
    setPaused(paused); show(0);
    setInterval(function () { if (!paused && !hover && !document.hidden) show(cur + 1); }, 8000);
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
  // Escalafón de C22: los mismos cuatro niveles y colores que ya usa el CSS
  // adicional del sitio («color por escalón»). Si alguien no está en la lista,
  // se ubica por su cargo.
  var GRUPOS = [
    ['Dirección y coordinación', 'g-dir', ['leonidas-montes', 'juan-luis-ossa', 'macarena-rivas'], /direct|presidente|coordinaci[oó]n ejecutiva/i],
    ['Investigadores', 'g-inv', ['aldo-mascareno', 'rosario-palacios'], null],
    ['Investigadores asistentes', 'g-ias', ['pablo-a-henriquez', 'juan-rozas', 'fabian-belmar'], /investigador(a)? asistente/i],
    ['Asistentes de investigación', 'g-asi', ['katherine-aravena', 'nicole-gardella', 'emilio-rogel', 'sebastian-aliaga'], /asistente de investigaci|pasant|pr[aá]ctic/i]
  ];
  // Cargos actualizados (cepchile.cl/equipo, oct. 2026). Lo correcto es
  // editarlos en la ficha de cada persona en WordPress; mientras tanto se
  // corrigen aquí.
  var CARGOS = { 'leonidas-montes': 'Presidente CEP', 'juan-luis-ossa': 'Director CEP' };
  function idDe(p) { return (p.getAttribute('data-id') || '').replace(/^modal-/, ''); }
  // en WordPress figuran en el histórico, pero son parte del equipo actual
  var ACTUALES = ['juan-luis-ossa'];
  function enEscalafon(p) { return ACTUALES.indexOf(idDe(p)) >= 0; }
  function orden(p) {
    for (var i = 0; i < GRUPOS.length; i++) { var k = GRUPOS[i][2].indexOf(idDe(p)); if (k >= 0) return k; }
    return 99;
  }
  function nivel(p, rol) {
    var id = (p.getAttribute('data-id') || '').replace(/^modal-/, '');
    for (var i = 0; i < GRUPOS.length; i++) if (GRUPOS[i][2].indexOf(id) >= 0) return i;
    for (var j = 0; j < GRUPOS.length; j++) if (GRUPOS[j][3] && GRUPOS[j][3].test(rol)) return j;
    return 1;
  }
  ready(function () {
    if (!document.body.classList.contains('page-template-plantilla-personas')) return;
    var lists = document.querySelectorAll('main .alm-listing');
    if (!lists.length) return;
    var grupos = GRUPOS.map(function (g) { return { name: g[0], cls: g[1], people: [] }; });
    grupos.push({ name: 'Equipo histórico', cls: 'g-his', hist: true, people: [] });
    var nAct = 0, nHis = 0;

    var dir = document.createElement('div');
    dir.className = 'c22-dir';
    dir.innerHTML = '<div class="c22-dir__tools"><input type="search" placeholder="Buscar por nombre, formación o cargo" aria-label="Buscar personas">' +
      '<div class="chips" role="group" aria-label="Filtrar"><button type="button" data-f="" aria-pressed="true">Todos</button>' +
      '<button type="button" data-f="act" aria-pressed="false">Equipo actual <span></span></button>' +
      '<button type="button" data-f="his" aria-pressed="false">Equipo histórico <span></span></button>' +
      '</div></div><p class="c22-dir__count" aria-live="polite"></p>';
    grupos.forEach(function (g) {
      var sec = document.createElement('section');
      sec.className = 'c22-dir__grupo ' + g.cls;
      sec.innerHTML = '<h2>' + esc(g.name) + '</h2><div class="c22-dir__people"></div>';
      g.sec = sec; g.box = sec.querySelector('.c22-dir__people');
      dir.appendChild(sec);
    });
    var wrap = lists[0].closest('.ajax-load-more-wrap') || lists[0];
    wrap.parentNode.insertBefore(dir, wrap);
    document.body.classList.add('c22-directorio');

    var input = dir.querySelector('input'), count = dir.querySelector('.c22-dir__count'), filtro = '';
    function render() {
      var q = norm(input.value.trim()), n = 0, total = nAct + nHis;
      grupos.forEach(function (g) {
        var vis = 0, on = !filtro || (filtro === 'his') === !!g.hist;
        g.people.forEach(function (p) { var hit = on && (!q || p._t.indexOf(q) >= 0); p.hidden = !hit; if (hit) vis++; });
        g.sec.hidden = !vis;
        n += vis;
      });
      dir.querySelector('[data-f="act"] span').textContent = nAct;
      dir.querySelector('[data-f="his"] span').textContent = nHis;
      dir.querySelector('[data-f="his"]').hidden = !nHis;
      count.textContent = n === total ? total + ' personas' : n + ' de ' + total + ' personas';
    }

    // Ajax Load More entrega las fichas por partes (y a veces tarde): cada vez que
    // llegan, se mueven a su grupo. Se mueven las fichas originales, así cada una
    // sigue abriendo su perfil.
    function absorber() {
      [].forEach.call(lists, function (list, k) {
        [].slice.call(list.querySelectorAll(':scope > .person')).forEach(function (p) {
          var hist = k > 0 && !enEscalafon(p);
          var cargo = CARGOS[idDe(p)], rolEl = p.querySelector('.rol');
          if (cargo && rolEl) rolEl.textContent = cargo;
          // el escalafón no tiene prácticas ni pasantías: en el equipo actual
          // figuran como asistentes de investigación
          if (!hist && rolEl && /pasant|pr[aá]ctic/i.test(rolEl.textContent)) rolEl.textContent = 'Asistente de investigación';
          p.classList.add('c22-p');
          if (hist) p.classList.add('c22-p-hist');
          if (!p.querySelector('.photo-container')) {  // sin foto: círculo con iniciales
            var nom = (p.querySelector('.title') || p).textContent.trim().split(/\s+/);
            var ini = document.createElement('div');
            ini.className = 'photo-container c22-ini';
            ini.setAttribute('aria-hidden', 'true');
            ini.textContent = (nom[0] || '').charAt(0) + (nom.length > 1 ? nom[nom.length - 1].charAt(0) : '');
            p.insertBefore(ini, p.firstChild);
          }
          p._t = norm(p.textContent);
          var rol = p.querySelector('.rol');
          var g = hist ? grupos[grupos.length - 1] : grupos[nivel(p, rol ? rol.textContent.trim() : '')];
          g.people.push(p); g.box.appendChild(p);
          if (hist) nHis++; else nAct++;
        });
      });
      // dentro de cada grupo, el orden del escalafón
      grupos.forEach(function (g) {
        if (g.hist) return;
        g.people.sort(function (a, b) { return orden(a) - orden(b); });
        g.people.forEach(function (p) { g.box.appendChild(p); });
      });
      render();
    }
    input.addEventListener('input', render);
    dir.querySelectorAll('.chips button').forEach(function (b) {
      b.addEventListener('click', function () {
        filtro = b.getAttribute('data-f');
        dir.querySelectorAll('.chips button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        render();
      });
    });
    absorber();
    if (window.MutationObserver) [].forEach.call(lists, function (l) { new MutationObserver(absorber).observe(l, { childList: true }); });
    // el histórico se carga por tandas al bajar (scroll infinito): se piden todas
    var intentos = 0, pedir = setInterval(function () {
      var bs = document.querySelectorAll('main .alm-load-more-btn:not(.done)');
      [].forEach.call(bs, function (b) { if (!b.classList.contains('loading')) b.click(); });
      // Ajax Load More pone el foco en la primera ficha que llega: sin
      // interacción, ese recuadro amarillo no corresponde
      var a = document.activeElement;
      if (a && a.closest && a.closest('.c22-dir__people')) a.blur();
      if (!bs.length || ++intentos > 20) clearInterval(pedir);
    }, 700);
  });

  /* ===== C22 eventos sin foto: fecha del evento en vez del logo ===== */
  // La tarjeta trae la fecha de publicación, no la del evento: la fecha real se
  // lee de la página del evento («15 julio 2026, 12:00 pm»). Mientras llega,
  // el recuadro queda reservado; si no se puede leer, se usa la de la tarjeta.
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function tileHtml(dia, mes, anio) { return '<b>' + dia + '</b>' + MES[mes] + '<i>' + anio + '</i>'; }
  function fechaTarjeta(c) {
    var d = c.querySelector('.date'), t = d ? (d.getAttribute('title') || d.textContent).trim() : '';
    var m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(t);
    if (m) return [+m[1], +m[2] - 1, m[3]];
    m = /(\d{1,2}) (\w{3}) (\d{4})/.exec(t);
    return m && MES.indexOf(m[2]) >= 0 ? [+m[1], MES.indexOf(m[2]), m[3]] : null;
  }
  // Ajax Load More entrega enlaces absolutos; en una copia del sitio (u otro
  // dominio) se leen desde la misma dirección base del sitio que se visita.
  function mismoSitio(href) {
    try {
      var u = new URL(href, location.href);
      if (u.host === location.host) return u.href;
      var logo = document.querySelector('header a.logo'), base = logo ? new URL(logo.href).pathname : '/';
      return location.origin + base.replace(/\/$/, '') + u.pathname;
    } catch (e) { return href; }
  }
  function eventos() {
    document.querySelectorAll('a.card[href*="/evento/"]:not(.c22-ev)').forEach(function (c) {
      var img = c.querySelector('img.photo');
      if (img && (img.getAttribute('src') || '').trim()) return;
      var tile = document.createElement('span');
      tile.className = 'c22-ev-fecha';
      tile.style.visibility = 'hidden';
      tile.innerHTML = tileHtml(1, 0, '0000');
      c.insertBefore(tile, c.firstChild);
      c.classList.add('c22-ev');
      function usar(f) { if (f) tile.innerHTML = tileHtml(f[0], f[1], f[2]); tile.style.visibility = f ? '' : 'hidden'; }
      if (!window.fetch || !window.DOMParser) return usar(fechaTarjeta(c));
      fetch(mismoSitio(c.getAttribute('href')), { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var p = doc.querySelector('.single-header p.date'), m = p && /(\d{1,2}) (?:de )?([a-záéíóú]+),? (?:de )?(\d{4})/i.exec(p.textContent.replace(/\s+/g, ' '));
        var k = m ? MESES.indexOf(m[2].toLowerCase()) : -1;
        usar(k >= 0 ? [+m[1], k, m[3]] : fechaTarjeta(c));
      }).catch(function () { usar(fechaTarjeta(c)); });
    });
  }
  ready(function () {
    eventos();
    if (window.MutationObserver) new MutationObserver(eventos).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  });

  /* ===== C22 fichas: sin título repetido ===== */
  // El texto de análisis y Puntos de Referencia empieza repitiendo el título.
  ready(function () {
    if (!document.body.classList.contains('single')) return;
    var h = document.querySelector('.single-header h1');
    var first = document.querySelector('main article .wysiwyg > h1:first-child, main article .wysiwyg > h2:first-child');
    if (h && first && norm(first.textContent.trim()) === norm(h.textContent.trim())) {
      first.classList.add('c22-oculto');
      var sig = first.nextElementSibling;  // y el párrafo vacío que lo sigue
      if (sig && sig.tagName === 'P' && !sig.textContent.replace(/\u00a0/g, '').trim() && !sig.querySelector('img, iframe')) sig.classList.add('c22-oculto');
    }
  });

  /* ===== C22 oportunidades: aviso cuando no hay convocatorias ===== */
  ready(function () {
    if (!document.body.classList.contains('page-template-plantilla-oportunidades')) return;
    var f = document.querySelector('main .wrap-xl.filters');
    if (!f) return;
    setTimeout(function () {
      if (document.querySelector('main .alm-listing > *:not(script):not(style)')) return;
      var c = document.querySelector('header a[href*="contacto"]'), url = c ? c.getAttribute('href') : '/contacto/';
      var m = document.createElement('p');
      m.className = 'c22-vacio';
      m.innerHTML = 'Por ahora no hay convocatorias abiertas. Si te interesa colaborar con C22, <a href="' + esc(url) + '">escríbenos</a> y te avisamos cuando abramos una.';
      f.appendChild(m);
    }, 1500);
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
