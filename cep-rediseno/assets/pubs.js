// Publicaciones al día: agrega al inicio de la lista lo que el CEP publicó después de
// la copia guardada en el HTML (lee la API; si no responde, queda la lista publicada).
(function () {
  var list = document.querySelector('.list');
  if (!list || !window.fetch) return;
  var SERIES = { 6: 'Puntos de Referencia', 7: 'Libros', 1742: 'Voces del CEP', 1831: 'Momento Económico', 8: 'Publicaciones indexadas', 715: 'Documentos de Trabajo' };
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var box = document.createElement('textarea');
  function txt(h) { box.innerHTML = h || ''; return box.value; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function slug(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  var have = {};
  list.querySelectorAll('h3 a').forEach(function (a) { have[a.getAttribute('href').replace(/^(\.\.\/)?investigacion\//, '').replace(/^https:\/\/www\.cepchile\.cl\/investigacion\//, '').replace(/\/$/, '')] = 1; });
  fetch('https://www.cepchile.cl/wp-json/wp/v2/investigation?per_page=20&_embed=wp:featuredmedia&_fields=id,date,link,title,excerpt,acf.numero,acf.categoria,_links,_embedded', { credentials: 'omit' })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (xs) {
      // solo lo posterior a la publicación más reciente de la copia guardada
      var t = list.querySelector('time'), M = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
      var p = t ? t.textContent.trim().split(' ') : null, last = p ? new Date(+p[2], M[p[1]], +p[0], 23, 59) : new Date(0);
      var fresh = xs.filter(function (x) { return new Date(x.date) > last && !have[x.link.replace(/^https:\/\/www\.cepchile\.cl\/investigacion\//, '').replace(/\/$/, '')]; });
      if (!fresh.length) return;
      var html = fresh.map(function (x) {
        var serie = SERIES[x.acf && x.acf.categoria] || 'Investigación', d = new Date(x.date);
        var m = /(\d+)/.exec((x.acf && x.acf.numero) || ''), label = serie + (serie === 'Puntos de Referencia' && m ? ' N° ' + m[1] : '');
        var fm = ((x._embedded || {})['wp:featuredmedia'] || [{}])[0], sz = (fm.media_details || {}).sizes || {};
        var src = (sz.medium || sz.medium_large || {}).source_url || fm.source_url;
        var dek = txt(x.excerpt && x.excerpt.rendered).replace(/\s+/g, ' ').trim();
        if (dek.length > 220) dek = dek.slice(0, 217).replace(/\s\S*$/, '') + '…';
        return '<div class="li" data-serie="' + slug(serie) + '" data-year="' + d.getFullYear() + '"><article class="row">' +
          (src ? '<a class="thumb" href="' + esc(x.link) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(src) + '" alt="" loading="lazy"></a>' : '') +
          '<div><p class="kicker"><span class="pill pill-' + slug(serie) + '">' + esc(label) + '</span> <time>' + ('0' + d.getDate()).slice(-2) + ' ' + MES[d.getMonth()] + ' ' + d.getFullYear() + '</time></p>' +
          '<h3 class="hl hl-m"><a href="' + esc(x.link) + '">' + esc(txt(x.title.rendered)) + '</a></h3>' + (dek ? '<p class="dek">' + esc(dek) + '</p>' : '') + '</div></article></div>';
      }).join('');
      list.insertAdjacentHTML('afterbegin', html);
      if (window.cepApplyFilters) window.cepApplyFilters();
    }).catch(function () {});
})();
