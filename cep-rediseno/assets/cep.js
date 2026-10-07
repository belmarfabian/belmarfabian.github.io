// Listados largos: 20 a la vez.
(function () {
  var btn = document.querySelector('.load-more button');
  if (!btn) return;
  var PAGE = 20, shown = PAGE;
  window.cepPaginate = function () {
    var vis = [].filter.call(document.querySelectorAll('.list .li'), function (r) { return !r.dataset.off; });
    vis.forEach(function (r, i) { r.hidden = i >= shown; });
    btn.hidden = vis.length <= shown;
  };
  btn.addEventListener('click', function () { shown += PAGE; window.cepPaginate(); });
  window.cepResetPage = function () { shown = PAGE; };
  window.cepPaginate();
})();

// Filtros de los listados (Publicaciones): serie, texto, año y autor. Quedan en la URL.
(function () {
  if (!document.querySelector('.list .li')) return;
  var chips = document.querySelectorAll('.filters .chip[data-serie]');
  var count = document.querySelector('.count span');
  var tools = document.querySelector('[data-pub-filters]');
  var qIn = tools && tools.querySelector('[data-q]'), ySel = tools && tools.querySelector('[data-year]'), aSel = tools && tools.querySelector('[data-author]');
  var empty = document.querySelector('[data-list-empty]');
  var p = new URLSearchParams(location.search);
  var st = { serie: p.get('serie') || '', q: p.get('q') || '', year: p.get('anio') || '', author: p.get('autor') || '' };
  function norm(t) { return (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function sync() {
    var url = new URL(location.href);
    [['serie', st.serie], ['q', st.q], ['anio', st.year], ['autor', st.author]].forEach(function (kv) {
      if (kv[1]) url.searchParams.set(kv[0], kv[1]); else url.searchParams.delete(kv[0]);
    });
    history.replaceState(null, '', url);
  }
  function apply() {
    var rows = document.querySelectorAll('.list .li'), n = 0, words = norm(st.q).split(/\s+/).filter(Boolean);
    rows.forEach(function (r) {
      if (r.dataset.text === undefined) r.dataset.text = norm(r.textContent + ' ' + (r.dataset.authors || '').replace(/\|/g, ' '));
      var y = r.dataset.year || ((r.querySelector('time') || {}).textContent || '').trim().slice(-4);
      var ok = (!st.serie || r.dataset.serie === st.serie) && (!st.year || y === st.year) &&
        (!st.author || ('|' + (r.dataset.authors || '') + '|').indexOf('|' + st.author + '|') >= 0) &&
        words.every(function (w) { return r.dataset.text.indexOf(w) >= 0; });
      if (ok) { delete r.dataset.off; n++; } else { r.dataset.off = '1'; r.hidden = true; }
    });
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.serie === st.serie)); });
    if (count) count.textContent = n;
    if (empty) {
      empty.hidden = n > 0;
      var a = empty.querySelector('a'); if (a) a.href = a.getAttribute('data-base') + (st.q ? '?q=' + encodeURIComponent(st.q) : '');
    }
    if (window.cepResetPage) { window.cepResetPage(); window.cepPaginate(); }
  }
  window.cepApplyFilters = apply;
  chips.forEach(function (c) { c.addEventListener('click', function () { st.serie = c.dataset.serie; sync(); apply(); }); });
  if (qIn) { qIn.value = st.q; var t; qIn.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { st.q = qIn.value.trim(); sync(); apply(); }, 150); }); }
  if (ySel) { ySel.value = st.year; ySel.addEventListener('change', function () { st.year = ySel.value; sync(); apply(); }); }
  if (aSel) { aSel.value = st.author; aSel.addEventListener('change', function () { st.author = aSel.value; sync(); apply(); }); }
  apply();
})();

// Equipo: buscador por nombre y filtro por área
(function () {
  var box = document.querySelector('[data-team-search]');
  if (!box) return;
  var chips = document.querySelectorAll('.team-tools .chip');
  var people = document.querySelectorAll('.person');
  var groups = document.querySelectorAll('.team-group');
  var count = document.querySelector('[data-team-count]');
  var area = '';
  function norm(t) { return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function apply() {
    var q = norm(box.value.trim()), n = 0;
    people.forEach(function (p) {
      var ok = (!q || norm(p.dataset.name).indexOf(q) >= 0) && (!area || (' ' + p.dataset.area + ' ').indexOf(' ' + area + ' ') >= 0);
      p.hidden = !ok; if (ok) n++;
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector('.person:not([hidden])'); });
    count.textContent = n;
  }
  box.addEventListener('input', apply);
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      area = c.dataset.area;
      chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
      apply();
    });
  });
})();
