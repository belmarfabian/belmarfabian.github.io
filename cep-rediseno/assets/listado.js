// Listados largos (temas, investigadores): filtro por tipo, por año y «Ver más» de 12 en 12
(function () {
  document.querySelectorAll('[data-list]').forEach(function (list) {
    var scope = list.closest('section') || document;
    var items = [].slice.call(list.children);
    var chips = scope.querySelectorAll('.chip[data-tab]'), ysel = scope.querySelector('[data-year-filter]');
    var more = scope.querySelector('.list-more'), count = scope.querySelector('.count span');
    var tab = '', year = '', shown = 12;
    function apply() {
      var vis = items.filter(function (li) { return (!tab || li.dataset.tab === tab) && (!year || li.dataset.year === year); });
      items.forEach(function (li) { li.hidden = true; });
      vis.slice(0, shown).forEach(function (li) { li.hidden = false; });
      if (more) more.parentNode.hidden = vis.length <= shown;
      if (count) count.textContent = vis.length;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.tab === tab)); });
    }
    chips.forEach(function (c) { c.addEventListener('click', function () { tab = c.dataset.tab; shown = 12; apply(); }); });
    if (ysel) ysel.addEventListener('change', function () { year = ysel.value; shown = 12; apply(); });
    if (more) more.addEventListener('click', function () { shown += 12; apply(); });
    apply();
  });
})();
