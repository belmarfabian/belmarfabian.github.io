// Portada en vivo: lee lo último de la API de WordPress del CEP al cargar la
// página y reemplaza destacados, «Lo más reciente», agenda y «Lo último».
// Si la API no responde, queda el contenido publicado en el HTML.
// Además rota el destacado central (cada 12 s), con controles y pausa (WCAG 2.2.2).
(function () {
  var API = 'https://www.cepchile.cl/wp-json/wp/v2/';
  var SERIES = { 6: 'Puntos de Referencia', 7: 'Libros', 1742: 'Voces del CEP', 1831: 'Momento Económico',
                 8: 'Publicaciones indexadas', 715: 'Documentos de Trabajo' };
  var EVENT = { 33: 'Seminario', 34: 'Arte y cultura' };
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var LOCAL = {};
  // temas con página propia en el prototipo; el resto enlaza a la página del tema en cepchile.cl
  var TEMAS = ["arte-y-cultura", "c22", "ciencias-sociales", "crecimiento-economico", "cultura", "democracia", "derecho", "desempleo", "economia", "educacion", "empleo", "entrevistas", "finanzas-publicas", "futuros-posibles", "humanidades", "identidad", "modernizacion-del-estado", "pobreza", "pobreza-y-desigualdad", "politica", "politica-fiscal", "politicas-publicas", "presupuesto-publico", "salud", "seguridad", "sociedad", "trabajo", "urbanismo-y-ciudad", "violencia"];
  function temaHref(t) { var s = slug(t); return TEMAS.indexOf(s) >= 0 ? 'tema/' + s + '/' : 'https://www.cepchile.cl/tema/' + s + '/'; }
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
    function start() { clearInterval(timer); timer = setInterval(tick, 12000); }
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


  /* ---------- sin repetidos: cada publicación aparece una sola vez ----------
     Recorre la portada en orden; si un titular ya salió más arriba, oculta la
     tarjeta o el ítem de abajo. Compara por enlace y por título. */
  function dedupe() {
    var seen = {}, titles = [];
    function keys(a) {
      var href = (a.getAttribute('href') || '').replace(/^https?:\/\/(www\.)?cepchile\.cl\//, '').replace(/\/$/, '');
      var t = a.textContent.trim().toLowerCase().normalize('NFD').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');
      return ['h:' + href.split('/').pop(), 't:' + t];
    }
    document.querySelectorAll('main .hl a, main .c22x-notes li a').forEach(function (a) {
      var item = a.closest('article, li, figure');
      if (!item || item.closest('.cifras')) return;
      var k = keys(a), dup = seen[k[0]] || (k[1].length > 24 && seen[k[1]]);
      // mismo título más corto o más largo (p. ej., libro y nota con subtítulo)
      if (!dup && k[1].length > 26) dup = titles.some(function (t) { return t.indexOf(k[1].slice(2)) === 0 || k[1].slice(2).indexOf(t) === 0; });
      if (dup && !item.closest('.lead')) { item.hidden = true; return; }
      seen[k[0]] = seen[k[1]] = 1;
      if (k[1].length > 26) titles.push(k[1].slice(2));
    });
  }
  dedupe();

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
    if (it.kind === 'post' && !(it.imgS || it.imgL)) {
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
      title(ev, 'hl-s') + '<p class="meta">' + DIA[d.getDay()] + ' · ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ' h' +
      (ev.yt ? ' · <a class="ev-video" href="' + esc(ev.yt) + '">' + (liveState(ev) === 'live' ? 'En vivo' : d < new Date() ? 'Ver grabación' : 'Transmisión') + '</a>' : '') +
      '</p></div></li>';
  }

  /* ---------- En vivo ----------
     Un evento está «en vivo» desde 15 minutos antes de su hora hasta 3 horas después
     (hora local del navegador, pensada para lectores en Chile). La franja aparece
     bajo el menú y enlaza a la transmisión de YouTube si el evento la tiene. */
  function ytUrl(o) {
    var s = typeof o === 'string' ? o : JSON.stringify(o || '');
    var m = /youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|live\/)([\w-]{11})|youtu\.be\/([\w-]{11})/.exec(s);
    return m ? 'https://www.youtube.com/watch?v=' + (m[1] || m[2]) : '';
  }
  function liveState(ev) {
    var t = Date.now(), s = +ev.date;
    if (t >= s && t <= s + 3 * 36e5) return 'live';
    if (t >= s - 15 * 6e4 && t < s) return 'soon';
    return '';
  }
  var LIVE_EVS = [];
  function liveBar(evs) {
    if (evs) LIVE_EVS = evs;
    var ev = LIVE_EVS.filter(function (e) { return liveState(e); }).sort(function (a, b) { return a.date - b.date; })[0];
    var bar = document.querySelector('.live-bar'), main = document.querySelector('main');
    if (!ev) { if (bar) bar.remove(); return; }
    var st = liveState(ev), d = ev.date, hh = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    var html = '<div class="wrap"><span class="live-dot' + (st === 'soon' ? ' soon' : '') + '"><i></i>' + (st === 'live' ? 'En vivo' : 'Por comenzar') + '</span>' +
      '<a class="live-t" href="' + esc(ev.href || ev.link) + '">' + esc(ev.title) + '</a>' +
      '<span class="live-m">' + esc(ev.series) + ' · ' + hh + ' h</span>' +
      '<a class="live-go" href="' + esc(ev.yt || ev.href || ev.link) + '">' + (ev.yt ? 'Ver transmisión' : 'Ver evento') + ' <span aria-hidden="true">▶</span></a></div>';
    if (!bar) { bar = document.createElement('div'); bar.className = 'live-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Evento en vivo'); main.insertBefore(bar, main.firstChild); }
    bar.innerHTML = html;
  }
  setInterval(function () { liveBar(); }, 60000);

  var F = 'id,date,link,title,featured_media,acf.numero,acf.categoria,acf.autores';
  Promise.all([
    get('investigation?per_page=16&_fields=' + F),
    get('posts?per_page=6&categories=31&_fields=id,date,link,title,featured_media,acf.autores'),
    get('surveys?per_page=1&_fields=id,date,link,title,featured_media,acf.numero'),
    get('events?per_page=12&_fields=id,link,title,featured_media,acf.fecha_inicio,acf.horario,acf.tipo_de_evento,acf.ubicacion,acf.contenido_flexible'),
    get('assets/local.json').catch(function () { return {}; })
  ]).then(function (r) {
    var local = r[4]; LOCAL = local;
    function norm(x, kind, series) {
      var loc = local[x.link] || {};
      var it = {
        kind: kind, id: x.id, link: x.link, title: txt(x.title.rendered), area: loc.ar || null,
        media: x.featured_media,
        date: new Date(x.date), series: series, numero: (x.acf && x.acf.numero) || '',
        href: loc.p || x.link, dek: loc.d || '', fig: loc.f || '', cap: loc.c || '', figTall: !!loc.ft, topics: loc.t || [], authors: loc.a || [],
        authorIds: (x.acf && x.acf.autores) || [], topicHref: temaHref
      };
      return it;
    }
    var inv = r[0].map(function (x) { return norm(x, 'inv', SERIES[x.acf && x.acf.categoria] || 'Investigación'); });
    var cols = r[1].map(function (x) { return norm(x, 'post', 'Opinión'); });
    var survey = r[2].map(function (x) { return norm(x, 'survey', 'Encuesta CEP'); })[0];
    var evs = r[3].filter(function (x) { return x.acf && x.acf.fecha_inicio; }).map(function (x) {
      var f = x.acf.fecha_inicio, it = norm(x, 'event', EVENT[x.acf.tipo_de_evento] || 'Actividad');
      it.date = new Date(+f.slice(0, 4), +f.slice(4, 6) - 1, +f.slice(6, 8), +(x.acf.horario || '0:0').split(':')[0], +(x.acf.horario || '0:0').split(':')[1]);
      it.yt = ytUrl(x.acf.contenido_flexible);
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
      show(inv, cols, survey, evs);
    });
  }).catch(function () { ready(); /* sin conexión con la API: queda el contenido publicado */ });

  /* ---------- sin parpadeo ----------
     Mientras llega la API, las zonas en vivo quedan ocultas (máx. 3 s, ver <head>).
     La última respuesta se guarda en el navegador: en la visita siguiente la portada
     aparece de inmediato con esos datos y solo se redibuja si hay algo nuevo. */
  var KEY = 'cep-portada-v1', shown = '';
  function ready() { document.documentElement.classList.remove('live-wait'); }
  function sig(a) { return JSON.stringify(a.map(function (l) { return (l || []).map(function (i) { return i && (i.link + (i.imgS || '')); }); })); }
  function show(inv, cols, survey, evs, fromCache) {
    var s = sig([inv, cols, [survey], evs]);
    if (s !== shown) { shown = s; render(inv, cols, survey, evs); }
    ready();
    if (!fromCache) try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: [inv, cols, survey, evs] })); } catch (e) {}
  }
  (function restore() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!c || Date.now() - c.t > 3 * 864e5) return;
      function h(i) { if (i) { i.date = new Date(i.date); i.topicHref = temaHref; } return i; }
      show(c.d[0].map(h), c.d[1].map(h), h(c.d[2]), c.d[3].map(h), true);
    } catch (e) {}
  })();

  function render(inv, cols, survey, evs) {
    // cifras del cierre institucional: último N° de Encuesta CEP y de Punto de Referencia
    var mE = survey && /(\d{1,4})/.exec(String(survey.numero)), nEnc = mE ? +mE[1] : 0;
    var nPdr = Math.max.apply(null, inv.filter(function (i) { return i.series === 'Puntos de Referencia'; })
      .map(function (i) { var m = /N°\s*(\d+)/.exec(String(i.numero)) || /(\d{1,4})/.exec(String(i.numero)); return m ? +m[1] : 0; }).concat([0]));
    var cE = document.querySelector('[data-count="encuesta"]'), cP = document.querySelector('[data-count="pdr"]');
    if (cE && nEnc) cE.textContent = nEnc;
    if (cP && nPdr) cP.textContent = nPdr;
    var used = {};
    // lo que ya muestran las secciones fijas (áreas, Voces, Opinión) no se repite arriba
    var fixed = {};
    document.querySelectorAll('.areas a[href], .band-coral a[href], .band-op a[href]').forEach(function (a) { fixed[a.getAttribute('href')] = 1; });
    inv.concat(cols).forEach(function (it) { if (fixed[it.href]) used[it.link] = 1; });
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
    // costados con lugares fijos: PdR y Voces a la izquierda; Podcast y Encuesta a la derecha
    var pdr = take(inv, 1, function (i) { return i.series === 'Puntos de Referencia'; });
    var voces = take(inv, 1, function (i) { return i.series === 'Voces del CEP'; });
    var left = pdr.concat(voces);
    var latest = take(inv, 6);

    function put(name, html) { var el = document.querySelector('[data-live="' + name + '"]'); if (el && html) el.innerHTML = html; }
    if (slides.length) {
      var wrap = document.querySelector('[data-live="slides"] .slides');
      wrap.innerHTML = slides.map(function (it, n) { return slide(it, n, slides.length); }).join('');
      rot.refresh();
    }
    if (left.length === 2) put('left', left.map(card).join(''));
    // Podcast: tarjeta fija en index.html (el sitio del CEP no publica un feed de podcast vigente)
    var pod = document.querySelector('[data-live="right"] .card-podcast');
    if (survey) {
      survey.numero = 'N° ' + (survey.numero || '');
      var sv = '<article class="card card-s card-encuesta">' + thumb(survey, 'thumb') +
        '<p class="kicker"><span class="pill pill-encuesta-cep">Encuesta CEP</span> <time>' + fecha(survey.date) + '</time></p>' +
        title(survey, 'hl-s') + '</article>';
      put('right', (pod ? pod.outerHTML : '') + sv);
    }
    put('latest', latest.map(row).join(''));

    var today = new Date(); today.setHours(0, 0, 0, 0);
    var next = evs.filter(function (e) { return e.date >= today; }).sort(function (a, b) { return a.date - b.date; }).slice(0, 3);
    var past = evs.filter(function (e) { return e.date < today; }).sort(function (a, b) { return b.date - a.date; }).slice(0, 2);
    if (next.length) put('agenda', next.map(agenda).join(''));
    if (past.length) put('agenda-past', past.map(agenda).join(''));
    liveBar(evs);

    dedupe();
    podcast();
    document.documentElement.setAttribute('data-live-ok', '');
  }

  // Podcast: último episodio de «Depósito de libros» (Spotify oEmbed, permite CORS).
  // Si Spotify no responde, queda la tarjeta verde con el enlace al programa.
  var POD = null;
  function podcast() {
    var c = document.querySelector('.card-podcast');
    if (!c || !POD || !POD.title) return;
    var a = c.querySelector('.thumb');
    if (POD.thumbnail_url) { a.className = 'thumb'; a.innerHTML = '<img src="' + esc(POD.thumbnail_url) + '" alt="" loading="lazy">'; }
    c.querySelector('.kicker').innerHTML = '<span class="pill pill-podcast">Podcast</span> <time>Depósito de libros</time>';
    c.querySelector('h3 a').textContent = POD.title;
  }
  get('https://open.spotify.com/oembed?url=https://open.spotify.com/show/4o6fMP8Z5rWS3X0DFVlWvO')
    .then(function (d) { POD = d; podcast(); }).catch(function () {});

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
        dedupe();
      }).catch(function () {});
  }
})();
