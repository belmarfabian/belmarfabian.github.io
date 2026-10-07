// Página de investigador: filtro por tipo y «Ver más» (12 ítems por vez)
(function () {
  var list = document.querySelector('.prof-list');
  if (!list) return;
  var items = [].slice.call(list.children), chips = document.querySelectorAll('.prof-work .chip');
  var more = document.querySelector('.prof-more'), tab = '', shown = 12;
  function apply() {
    var vis = items.filter(function (li) { return !tab || li.dataset.tab === tab; });
    items.forEach(function (li) { li.hidden = true; });
    vis.slice(0, shown).forEach(function (li) { li.hidden = false; });
    more.parentNode.hidden = vis.length <= shown;
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.tab === tab)); });
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { tab = c.dataset.tab; shown = 12; apply(); }); });
  more.addEventListener('click', function () { shown += 12; apply(); });
  apply();
})();
