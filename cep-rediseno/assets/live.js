// Portada en vivo: lee lo último de la API de WordPress del CEP al cargar la
// página y reemplaza destacados, «Lo más reciente», agenda y «Lo último».
// Si la API no responde, queda el contenido publicado en el HTML.
// Además rota el destacado central, con controles y pausa (WCAG 2.2.2).
(function () {
  var API = 'https://www.cepchile.cl/wp-json/wp/v2/';
  var SERIES = { 6: 'Puntos de Referencia', 7: 'Libros', 1742: 'Voces del CEP', 1831: 'Momento Económico',
                 8: 'Publicaciones indexadas', 715: 'Documentos de Trabajo' };
  var EVENT = { 33: 'Seminario', 34: 'Arte y cultura' };
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- rotación del destacado ---------- */
  var rot = (function () {
    var root = document.querySelector('[data-live="slides"]');
    if (!root) return { refresh: function () {} };
    var ctl = root.querySelector('.slide-ctl'), dots = root.querySelector('.sc-dots');
    var btnPause = root.querySelector('.sc-pause');
    var slides = [], i = 0, timer = null, userPaused = reduce, hover = false;
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === i;
        s.classList.toggle('is-on', on);
        s.setAttribute('aria-hidden', String(!on));
        if ('inert' in s) s.inert = !on;
      });
      [].forEach.call(dots.children, function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }
    function tick() { if (!userPaused && !hover && !document.hidden) show(i + 1); }
    function start() { clearInterval(timer); timer = setInterval(tick, 7000); }
    function setPaused(p) {
      userPaused = p;
      btnPause.textContent = p ? 'Reanudar' : 'Pausar';
      btnPause.setAttribute('aria-label', p ? 'Reanudar rotación' : 'Pausar rotación');
      btnPause.setAttribute('aria-pressed', String(p));
    }
    root.querySelector('.sc-prev').addEventListener('click', function () { show(i - 1); });
    root.querySelector('.sc-next').addEventListener('click', function () { show(i + 1); });
    btnPause.addEventListener('click', function () { setPaused(!userPaused); });
    root.addEventListener('mouseenter', function () { hover = true; });
    root.addEventListener('mouseleave', function () { hover = false; });
    root.addEventListener('focusin', function () { hover = true; });
    root.addEventListener('focusout', function () { hover = false; });
    function refresh() {
      slides = [].slice.call(root.querySelectorAll('.slide'));
      ctl.hidden = slides.length < 2;
      dots.innerHTML = '';
      slides.forEach(function (_, k) {
        var b = document.createElement('button');
        b.className = 'sc-dot';
        b.setAttribute('aria-label', 'Destacado ' + (k + 1));
        b.addEventListener('click', function () { show(k); });
        dots.appendChild(b);
      });
      if (slides.length) show(0);
    }
    setPaused(userPaused);
    refresh();
    start();
    return { refresh: refresh };
  })();

  /* ---------- datos en vivo ---------- */
  if (!window.fetch || !document.querySelector('[data-live]')) return;

  function get(path) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, 9000);
    return fetch(path.indexOf('http') === 0 || path.indexOf('assets/') === 0 ? path : API + path,
                 { credentials: 'omit', signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  var box = document.createElement('textarea');
  function txt(h) { box.innerHTML = h || ''; return box.value; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function slug(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function fecha(d) { return ('0' + d.getDate()).slice(-2) + ' ' + MES[d.getMonth()] + ' ' + d.getFullYear(); }

  function kicker(it) {
    var label = it.series, m = /N° ?(\d+)/.exec(it.numero || '');
    if (it.series === 'Puntos de Referencia' && m) label += ' N° ' + m[1];
    return '<p class="kicker"><span class="pill pill-' + slug(it.series) + '">' + esc(label) + '</span>' +
      (it.kind === 'event' ? '' : ' <time>' + fecha(it.date) + '</time>') + '</p>';
  }
  function thumb(it, cls, big) {
    if (it.kind === 'post') {
      return '<a class="' + cls + ' ph ph-op ar-' + slug(it.area || 'x') + '" href="' + esc(it.href) + '" tabindex="-1" aria-hidden="true"><i aria-hidden="true">“</i><span>' +
        esc(it.topics[0] || 'Opinión') + '</span></a>';
    }
    if (it.fig) return '<a class="' + cls + ' fig' + (it.figTall ? ' fig-tall' : '') + '" href="' + esc(it.href) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(it.fig) + '" alt="" loading="lazy"></a>';
    var src = big ? (it.imgL || it.imgS) : (it.imgS || it.imgL);
    if (src) return '<a class="' + cls + '" href="' + esc(it.href) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(src) + '" alt="" loading="lazy"></a>';
    return '<a class="' + cls + ' ph ph-' + slug(it.series) + '" href="' + esc(it.href) + '" tabindex="-1" aria-hidden="true"><span>' + esc(it.series) + '</span></a>';
  }
  function by(it) {
    var a = it.authors;
    if (!a.length) return '';
    var t = a[0] + (a.length > 2 ? ' y ' + (a.length - 1) + ' más' : a.length === 2 ? ' y ' + a[1] : '');
    return '<p class="by">' + esc(t) + '</p>';
  }
  function title(it, cls, tag) {
    return '<' + (tag || 'h3') + ' class="hl ' + cls + '"><a href="' + esc(it.href) + '">' + esc(it.title) + '</a></' + (tag || 'h3') + '>';
  }
  function card(it) { return '<article class="card card-s">' + thumb(it, 'thumb') + kicker(it) + title(it, 'hl-s') + '</article>'; }
  function row(it) {
    return '<article class="row">' + thumb(it, 'thumb') + '<div>' + kicker(it) + title(it, 'hl-m') +
      (it.dek ? '<p class="dek">' + esc(it.dek) + '</p>' : '') + by(it) + '</div></article>';
  }
  function slide(it, n, total) {
    var topics = it.topics.map(function (t) { return '<a href="' + esc(it.topicHref(t)) + '">' + esc(t) + '</a>'; }).join(' <span>|</span> ');
    return '<article class="slide" role="group" aria-roledescription="diapositiva" aria-label="' + (n + 1) + ' de ' + total + '">' +
      thumb(it, 'thumb thumb-lead', true) + (it.cap ? '<p class="fig-cap">' + esc(it.cap) + '</p>' : '') + kicker(it) + title(it, 'hl-xl', 'h2') +
      (it.dek ? '<p class="dek">' + esc(it.dek) + '</p>' : '') + by(it) +
      (topics ? '<p class="sublinks">' + topics + '</p>' : '') + '</article>';
  }
  function agenda(ev) {
    var d = ev.date;
    return '<li><time datetime="' + d.toISOString().slice(0, 10) + '"><b>' + d.getDate() + '</b>' + MES[d.getMonth()].toUpperCase() + '</time>' +
      '<div><p class="kicker"><span class="pill pill-' + slug(ev.series) + '">' + esc(ev.series) + '</span></p>' +
      title(ev, 'hl-s') + '<p class="meta">' + DIA[d.getDay()] + ' · ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ' h</p></div></li>';
  }

  var F = 'id,date,link,title,featured_media,acf.numero,acf.categoria,acf.autores';
  Promise.all([
    get('investigation?per_page=16&_fields=' + F),
    get('posts?per_page=6&categories=31&_fields=id,date,link,title,featured_media,acf.autores'),
    get('surveys?per_page=1&_fields=id,date,link,title,featured_media,acf.numero'),
    get('events?per_page=12&_fields=id,link,title,featured_media,acf.fecha_inicio,acf.horario,acf.tipo_de_evento'),
    get('assets/local.json').catch(function () { return {}; })
  ]).then(function (r) {
    var local = r[4];
    function norm(x, kind, series) {
      var loc = local[x.link] || {};
      var it = {
        kind: kind, id: x.id, link: x.link, title: txt(x.title.rendered), area: loc.ar || null,
        media: kind === 'post' ? 0 : x.featured_media,  // columnas: sin retratos
        date: new Date(x.date), series: series, numero: (x.acf && x.acf.numero) || '',
        href: loc.p || x.link, dek: loc.d || '', fig: loc.f || '', cap: loc.c || '', figTall: !!loc.ft, topics: loc.t || [], authors: loc.a || [],
        authorIds: (x.acf && x.acf.autores) || [], topicHref: function (t) { return 'tema/' + slug(t) + '/'; }
      };
      return it;
    }
    var inv = r[0].map(function (x) { return norm(x, 'inv', SERIES[x.acf && x.acf.categoria] || 'Investigación'); });
    var cols = r[1].map(function (x) { return norm(x, 'post', 'Opinión'); });
    var survey = r[2].map(function (x) { return norm(x, 'survey', 'Encuesta CEP'); })[0];
    var evs = r[3].filter(function (x) { return x.acf && x.acf.fecha_inicio; }).map(function (x) {
      var f = x.acf.fecha_inicio, it = norm(x, 'event', EVENT[x.acf.tipo_de_evento] || 'Actividad');
      it.date = new Date(+f.slice(0, 4), +f.slice(4, 6) - 1, +f.slice(6, 8), +(x.acf.horario || '0:0').split(':')[0], +(x.acf.horario || '0:0').split(':')[1]);
      return it;
    });
    if (!inv.length) return;

    // imágenes y autores que falten, en dos consultas
    var all = inv.concat(cols, survey ? [survey] : []);
    var mids = all.map(function (i) { return i.media; }).filter(Boolean);
    var aids = [];
    all.forEach(function (i) { if (!i.authors.length) aids = aids.concat(i.authorIds); });
    return Promise.all([
      mids.length ? get('media?per_page=50&include=' + mids.join(',') + '&_fields=id,source_url,media_details') : [],
      aids.length ? get('team?per_page=50&include=' + aids.join(',') + '&_fields=id,title').catch(function () { return []; }) : []
    ]).then(function (m) {
      var media = {}, team = {};
      m[0].forEach(function (x) {
        var s = (x.media_details && x.media_details.sizes) || {};
        media[x.id] = { s: (s.medium || s.medium_large || s.full || {}).source_url || x.source_url,
                        l: (s.medium_large || s.large || s.full || {}).source_url || x.source_url };
      });
      m[1].forEach(function (x) { team[x.id] = txt(x.title.rendered); });
      all.forEach(function (i) {
        var md = media[i.media] || {};
        i.imgS = md.s; i.imgL = md.l;
        if (!i.authors.length) i.authors = i.authorIds.map(function (a) { return team[a]; }).filter(Boolean);
      });
      render(inv, cols, survey, evs);
    });
  }).catch(function () { /* sin conexión con la API: queda el contenido publicado */ });

  function render(inv, cols, survey, evs) {
    var used = {};
    function take(list, n, ok) {
      var out = [];
      for (var k = 0; k < list.length && out.length < n; k++) {
        var it = list[k];
        if (!used[it.link] && (!ok || ok(it))) { used[it.link] = 1; out.push(it); }
      }
      return out;
    }
    // destacados: uno por área (economía, política, sociedad) y el más reciente que falte
    var slides = [];
    ['Economía', 'Política', 'Sociedad'].forEach(function (a) {
      slides = slides.concat(take(inv.slice(0, 30), 1, function (i) { return i.area === a && (i.fig || i.imgL); }));
    });
    slides = slides.concat(take(inv, 4 - slides.length, function (i) { return i.fig || i.imgL; }));
    slides.sort(function (a, b) { return b.date - a.date; });
    var left = take(inv, 2, function (i) { return (i.fig || i.imgS) && i.series !== 'Voces del CEP'; });
    var voces = take(inv, 1, function (i) { return i.series === 'Voces del CEP'; });
    var right = (voces.length ? voces : take(cols, 1)).concat(survey ? [survey] : []);
    var latest = take(inv, 6);

    function put(name, html) { var el = document.querySelector('[data-live="' + name + '"]'); if (el && html) el.innerHTML = html; }
    if (slides.length) {
      var wrap = document.querySelector('[data-live="slides"] .slides');
      wrap.innerHTML = slides.map(function (it, n) { return slide(it, n, slides.length); }).join('');
      rot.refresh();
    }
    put('left', left.map(card).join(''));
    put('right', right.map(card).join(''));
    put('latest', latest.map(row).join(''));

    var today = new Date(); today.setHours(0, 0, 0, 0);
    var next = evs.filter(function (e) { return e.date >= today; }).sort(function (a, b) { return a.date - b.date; }).slice(0, 3);
    var past = evs.filter(function (e) { return e.date < today; }).sort(function (a, b) { return b.date - a.date; }).slice(0, 2);
    if (next.length) put('agenda', next.map(agenda).join(''));
    if (past.length) put('agenda-past', past.map(agenda).join(''));

    var newest = inv.concat(cols).sort(function (a, b) { return b.date - a.date; })[0];
    put('ticker', '<b>Lo último</b> <a href="' + esc(newest.href) + '">' + esc(newest.title) + '</a>');
    document.documentElement.setAttribute('data-live-ok', '');
  }

  // C22: últimos análisis online desde la API de c22cepchile.cl
  var c22 = document.querySelector('[data-live="c22"]');
  if (c22) {
    get('https://c22cepchile.cl/wp-json/wp/v2/analisis?per_page=4&_embed=wp:featuredmedia&_fields=id,date,link,title,_links,_embedded')
      .then(function (xs) {
        if (!xs.length) return;
        c22.innerHTML = xs.slice(1, 4).map(function (x) {
          var fm = ((x._embedded || {})['wp:featuredmedia'] || [{}])[0], sz = (fm.media_details || {}).sizes || {};
          var src = (sz.medium_large || sz.large || sz.full || {}).source_url || fm.source_url;
          var it = { kind: 'c22', series: 'Análisis online', title: txt(x.title.rendered), href: x.link, date: new Date(x.date), imgS: src };
          return '<article class="card card-s">' + (src ? thumb(it, 'thumb') : '<a class="thumb ph ph-c22" href="' + esc(x.link) + '" tabindex="-1" aria-hidden="true"><span>C22</span></a>') +
            '<p class="kicker"><span class="pill pill-c22">Análisis online</span> <time>' + fecha(it.date) + '</time></p>' + title(it, 'hl-s') + '</article>';
        }).join('');
      }).catch(function () {});
  }
})();
