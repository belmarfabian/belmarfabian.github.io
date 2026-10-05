// Eventos en vivo: lee la agenda desde la API del CEP y separa próximos y anteriores
// según la fecha de hoy. Si la API no responde, queda la lista publicada en el HTML,
// pero igual se mueven a «Anteriores» los eventos cuya fecha ya pasó.
(function () {
  var MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var TIPO = { 33: 'Seminario', 34: 'Arte y cultura' };
  var heads = document.querySelectorAll('main .sec-head');
  if (heads.length < 2) return;
  var hUp = heads[0], hPast = heads[1];
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var box = document.createElement('textarea');
  function txt(h) { box.innerHTML = h || ''; return box.value; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function empty(msg) { var p = document.createElement('p'); p.className = 'meta ev-empty'; p.textContent = msg; return p; }

  function place(items) { // items: [{date, html}]
    document.querySelectorAll('main article.ev, main .ev-empty').forEach(function (e) { e.remove(); });
    var up = items.filter(function (i) { return i.date >= today; }).sort(function (a, b) { return a.date - b.date; });
    var past = items.filter(function (i) { return i.date < today; }).sort(function (a, b) { return b.date - a.date; }).slice(0, 12);
    var frag = document.createElement('div');
    frag.innerHTML = up.map(function (i) { return i.html; }).join('');
    var ref = hPast;
    if (!up.length) hPast.parentNode.insertBefore(empty('No hay eventos programados por ahora.'), ref);
    while (frag.firstChild) hPast.parentNode.insertBefore(frag.firstChild, ref);
    frag.innerHTML = past.map(function (i) { return i.html.replace(/<p><a class="?btn-sm"?[^>]*>[^<]*<\/a><\/p>/, ''); }).join('');
    var after = hPast.nextSibling;
    while (frag.firstChild) hPast.parentNode.insertBefore(frag.firstChild, after);
  }

  // 1) sin red: reordenar lo publicado según la fecha de hoy
  var stat = [].map.call(document.querySelectorAll('main article.ev'), function (a) {
    var d = a.querySelector('time').getAttribute('datetime').split('-');
    return { date: new Date(+d[0], +d[1] - 1, +d[2]), html: a.outerHTML };
  });
  place(stat);

  // 2) con red: agenda vigente desde la API
  if (!window.fetch) return;
  fetch('https://www.cepchile.cl/wp-json/wp/v2/events?per_page=40&_fields=id,link,title,acf', { credentials: 'omit' })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (xs) {
      var items = xs.filter(function (x) { return x.acf && x.acf.fecha_inicio; }).map(function (x) {
        var f = x.acf.fecha_inicio, hh = (x.acf.horario || '00:00').split(':');
        var d = new Date(+f.slice(0, 4), +f.slice(4, 6) - 1, +f.slice(6, 8), +hh[0], +hh[1]);
        var reg = x.acf.registro && x.acf.registro.url;
        var lugar = (x.acf.ubicacion || 'Auditorio CEP, Monseñor Sótero Sanz 162, Providencia.').replace(/,? ubicado en/, ',');
        var html = '<article class="ev"><time datetime="' + f.slice(0, 4) + '-' + f.slice(4, 6) + '-' + f.slice(6, 8) + '"><b>' + d.getDate() + '</b>' +
          MES[d.getMonth()].slice(0, 3).toUpperCase() + ' ' + d.getFullYear() + '</time><div><p class="kicker">' + (TIPO[x.acf.tipo_de_evento] || 'Actividad') + '</p>' +
          '<h3 class="hl hl-m"><a href="' + esc(x.link) + '">' + esc(txt(x.title.rendered)) + '</a></h3>' +
          '<p class="meta">' + DIA[d.getDay()] + ' ' + d.getDate() + ' de ' + MES[d.getMonth()] + ', ' + hh[0] + ':' + hh[1] + ' h · ' + esc(lugar) + '</p>' +
          (reg ? '<p><a class="btn-sm" href="' + esc(reg) + '">Inscribirse</a></p>' : '') + '</div></article>';
        return { date: d, html: html };
      });
      if (items.length) place(items);
    }).catch(function () {});
})();
