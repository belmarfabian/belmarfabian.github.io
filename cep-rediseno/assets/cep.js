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

// Filtro por serie en los listados; la serie queda en la URL (?serie=...).
(function () {
  var chips = document.querySelectorAll('.filters .chip[data-serie]');
  var rows = document.querySelectorAll('.list .li');
  if (!chips.length || !rows.length) return;
  var count = document.querySelector('.count span');
  function apply(serie) {
    var n = 0;
    rows.forEach(function (r) {
      var show = !serie || r.dataset.serie === serie;
      if (show) { delete r.dataset.off; n++; } else { r.dataset.off = '1'; r.hidden = true; }
    });
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.serie === serie)); });
    if (count) count.textContent = n;
    if (window.cepResetPage) { window.cepResetPage(); window.cepPaginate(); }
  }
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var s = c.dataset.serie;
      var url = new URL(location.href);
      if (s) url.searchParams.set('serie', s); else url.searchParams.delete('serie');
      history.replaceState(null, '', url);
      apply(s);
    });
  });
  apply(new URLSearchParams(location.search).get('serie') || '');
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
