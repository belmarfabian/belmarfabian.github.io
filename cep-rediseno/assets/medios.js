// CEP en los medios: últimas entrevistas a investigadores (categoría Entrevistas de cepchile.cl)
(function () {
  var host = document.querySelector('.band-op');
  if (!host || !window.fetch) return;
  // si la API no responde, queda la copia guardada en el HTML
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var box = document.createElement('textarea');
  function txt(h) { box.innerHTML = h || ''; return box.value; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  fetch('https://www.cepchile.cl/wp-json/wp/v2/posts?categories=748&per_page=4&_embed=wp:featuredmedia&_fields=date,title,link,excerpt,_links,_embedded', { credentials: 'omit' })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (xs) {
      if (!xs.length) return;
      var cards = xs.map(function (x) {
        var t = txt(x.title.rendered), i = t.indexOf(':'), who = i > 0 ? t.slice(0, i) : '', q = i > 0 ? t.slice(i + 1).trim() : t;
        var medio = txt((x.excerpt && x.excerpt.rendered || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
        var fm = ((x._embedded || {})['wp:featuredmedia'] || [{}])[0], sz = (fm.media_details || {}).sizes || {};
        var src = (sz.medium_large || sz.medium || {}).source_url || fm.source_url, d = new Date(x.date);
        return '<article class="card med">' + (src ? '<a class="thumb" href="' + esc(x.link) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(src) + '" alt="" loading="lazy"></a>' : '') +
          '<p class="kicker"><span class="pill pill-medios">Entrevista</span> <time>' + d.getDate() + ' ' + MES[d.getMonth()] + ' ' + d.getFullYear() + '</time></p>' +
          (who ? '<p class="med-who">' + esc(who) + (medio ? ' <span>en ' + esc(medio) + '</span>' : '') + '</p>' : '') +
          '<h3 class="hl hl-s med-q"><a href="' + esc(x.link) + '">' + esc(q) + '</a></h3></article>';
      }).join('');
      var grid = document.querySelector('[data-live="medios"]');
      if (grid) { grid.innerHTML = cards; return; }
      var sec = document.createElement('section');
      sec.className = 'medios'; sec.setAttribute('aria-labelledby', 'medios-h');
      sec.innerHTML = '<header class="sec-head"><h2 id="medios-h">El CEP en los medios</h2><a class="more" href="https://www.cepchile.cl/noticias/?tag=entrevistas">Ver todo</a></header>' +
        '<p class="band-intro">Entrevistas a nuestros investigadores en prensa, radio y televisión.</p><div class="grid4 medios-grid" data-live="medios">' + cards + '</div>';
      host.parentNode.insertBefore(sec, host.nextSibling);
    }).catch(function () {});
})();
