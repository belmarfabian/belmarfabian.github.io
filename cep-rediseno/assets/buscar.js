// Buscador del sitio: consulta en vivo la búsqueda de cepchile.cl (todo el archivo) y abre aquí
// las páginas que ya existen en este sitio. Personas y temas se buscan en datos locales.
(function () {
  var API = 'https://www.cepchile.cl/wp-json/wp/v2/search';
  var SERIES = { 6: 'Puntos de Referencia', 7: 'Libros', 1742: 'Voces del CEP', 1831: 'Momento Económico', 8: 'Publicaciones indexadas', 715: 'Documentos de Trabajo' };
  var TYPE = { investigation: 'Investigación', post: 'Opinión y noticias', events: 'Evento', surveys: 'Encuesta CEP', page: 'Página', team: 'Persona' };
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var D = JSON.parse(document.getElementById('search-data').textContent);
  var form = document.querySelector('.search-big'), input = form.querySelector('input');
  var out = document.querySelector('[data-results]'), status = document.querySelector('[data-status]');
  var more = document.querySelector('[data-more]'), types = document.querySelector('[data-types]'), quick = document.querySelector('[data-quick]');
  var q = new URLSearchParams(location.search).get('q') || '', type = new URLSearchParams(location.search).get('tipo') || '', page = 1, total = 0;
  var box = document.createElement('textarea');
  function txt(h) { box.innerHTML = h || ''; return box.value; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(t) { return (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function slugOf(u) { var p = u.replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '').split('/'); return { base: p[0], last: p[p.length - 1] }; }
  function localHref(u) {
    var s = slugOf(u);
    if (s.base === 'investigacion' && D.local.investigacion.indexOf(s.last) >= 0) return '../investigacion/' + s.last + '/';
    if (s.base === 'equipo' && D.local.equipo.indexOf(s.last) >= 0) return '../equipo/' + s.last + '/';
    if (D.local.opinion.indexOf(s.last) >= 0) return '../opinion/' + s.last + '/';
    return u;
  }
  function fecha(iso) { if (!iso) return ''; var d = new Date(iso); return d.getDate() + ' ' + MES[d.getMonth()] + ' ' + d.getFullYear(); }
  function row(r) {
    var e = ((r._embedded || {}).self || [{}])[0], acf = e.acf || {};
    var label = TYPE[r.subtype] || 'Página', cls = 'pill-' + (r.subtype === 'post' ? 'opinion' : r.subtype === 'events' ? 'seminario' : r.subtype === 'surveys' ? 'encuesta-cep' : 'puntos-de-referencia');
    if (r.subtype === 'investigation' && SERIES[acf.categoria]) { label = SERIES[acf.categoria]; cls = 'pill-' + norm(label).replace(/[^a-z0-9]+/g, '-'); if (label === 'Puntos de Referencia' && /\d+/.test(acf.numero || '')) label += ' N° ' + String(acf.numero).match(/\d+/)[0]; }
    if (r.subtype === 'surveys' && acf.numero) label = 'Encuesta CEP N° ' + acf.numero;
    var href = localHref(r.url), here = href.indexOf('http') !== 0;
    return '<li class="li-row li-compact"><time>' + fecha(e.date) + '</time><div><p class="kicker"><span class="pill ' + esc(cls) + '">' + esc(label) + '</span>' +
      (here ? ' <span class="here">En este sitio</span>' : '') + '</p><h3 class="hl hl-s"><a href="' + esc(href) + '">' + esc(txt(r.title)) + '</a></h3></div></li>';
  }
  function quickMatches() {
    var w = norm(q).split(/\s+/).filter(Boolean);
    if (!w.length) { quick.hidden = true; return; }
    var hit = function (s) { var n = norm(s); return w.every(function (x) { return n.indexOf(x) >= 0; }); };
    var people = D.team.filter(function (p) { return hit(p.n + ' ' + p.r); }).slice(0, 6);
    var temas = D.temas.filter(function (t) { return hit(t.n); }).slice(0, 6);
    if (!people.length && !temas.length) { quick.hidden = true; return; }
    quick.innerHTML = (people.length ? '<div><h2>Personas</h2><ul class="sq-people">' + people.map(function (p) {
      return '<li><a href="../equipo/' + esc(p.s) + '/"><img src="../img/team/' + esc(p.i) + '" alt="" width="44" height="44"><span><b>' + esc(p.n) + '</b>' + (p.r ? '<em>' + esc(p.r) + '</em>' : '') + '</span></a></li>';
    }).join('') + '</ul></div>' : '') + (temas.length ? '<div><h2>Temas</h2><ul class="sq-temas">' + temas.map(function (t) {
      return '<li><a class="chip" href="../tema/' + esc(t.s) + '/">' + esc(t.n) + '</a></li>';
    }).join('') + '</ul></div>' : '');
    quick.hidden = false;
  }
  function load(reset) {
    if (!q) { status.textContent = ''; types.hidden = true; return; }
    if (reset) { page = 1; out.innerHTML = ''; }
    status.textContent = 'Buscando…'; more.hidden = true;
    var url = API + '?search=' + encodeURIComponent(q) + '&per_page=20&page=' + page + '&_embed=self' + (type ? '&subtype=' + type : '&subtype=investigation,post,events,surveys');
    fetch(url, { credentials: 'omit' }).then(function (r) {
      total = +(r.headers.get('X-WP-Total') || 0);
      if (!r.ok) throw r.status; return r.json();
    }).then(function (xs) {
      out.insertAdjacentHTML('beforeend', xs.map(row).join(''));
      var shown = out.children.length;
      status.textContent = total ? (total === 1 ? '1 resultado' : total.toLocaleString('es-CL') + ' resultados') + ' para «' + q + '»' : 'No encontramos resultados para «' + q + '».';
      more.hidden = shown >= total; types.hidden = false;
    }).catch(function () {
      status.innerHTML = 'La búsqueda no está disponible en este momento. <a href="https://www.cepchile.cl/buscador/?s=' + encodeURIComponent(q) + '">Buscar en cepchile.cl</a>';
    });
  }
  types.querySelectorAll('.chip').forEach(function (c) {
    c.setAttribute('aria-pressed', String(c.dataset.type === type));
    c.addEventListener('click', function () {
      type = c.dataset.type;
      types.querySelectorAll('.chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
      var u = new URL(location.href); if (type) u.searchParams.set('tipo', type); else u.searchParams.delete('tipo'); history.replaceState(null, '', u);
      load(true);
    });
  });
  more.addEventListener('click', function () { page++; load(false); });
  input.value = q;
  if (q) { document.title = q + ' · Buscar | CEP Chile'; quickMatches(); load(true); } else { input.focus(); }
})();
