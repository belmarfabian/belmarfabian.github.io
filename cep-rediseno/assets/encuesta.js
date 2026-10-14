// Encuesta CEP: si la API del CEP ya tiene una medición más nueva que la publicada en este
// HTML, actualiza «Última medición», su ficha técnica y la tabla de mediciones.
// La ficha sale del bloque «Datos de la muestra» de la encuesta. Si no se puede leer,
// se oculta la ficha anterior para no mostrar datos de otra medición.
(function () {
  var feat = document.querySelector('.feature-survey[data-num]');
  if (!feat || !window.fetch || !window.DOMParser) return;
  var API = 'https://www.cepchile.cl/wp-json/wp/v2/';
  var ficha = document.getElementById('ficha');
  var box = document.createElement('textarea');
  function txt(h) { box.innerHTML = h || ''; return box.value; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function get(u) { return fetch(API + u, { credentials: 'omit' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }); }

  // «Datos de la muestra» → [{k: 'Población objetivo', v: ['…']}, …]. Los títulos van en <strong> o <b>.
  function items(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html'), out = [], cur = null, n;
    var w = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    while ((n = w.nextNode())) {
      var t = n.nodeValue.replace(/\s+/g, ' ').trim(), el = n.parentNode;
      if (!t || el.closest('h1,h2,h3,h4')) continue;
      var head = el.closest('strong,b'), li = el.closest('li');
      if (head) {
        if (cur && cur.h === head) cur.k += ' ' + t; else { cur = { h: head, k: t, v: [] }; out.push(cur); }
        continue;
      }
      if (!cur) continue;
      if (li && cur.li === li) cur.v[cur.v.length - 1] += ' ' + t; else cur.v.push(t);
      cur.li = li;
    }
    return out.filter(function (i) { return i.v.length; });
  }
  function keys(all) {
    var t = all.map(function (i) { return i.k + ': ' + i.v.join(' '); }).join(' '), m, k = [];
    if ((m = /entre el (\d{1,2}) de ([a-záéíóú]+)(?: de (\d{4}))? y el (\d{1,2}) de ([a-záéíóú]+)(?: (?:de )?(\d{4}))?/i.exec(t)))
      k.push(['Trabajo de campo', m[1] + ' ' + m[2].slice(0, 3) + '. – ' + m[4] + ' ' + m[5].slice(0, 3) + '. ' + (m[6] || m[3] || '')]);
    if ((m = /([\d.]+)\s+personas entrevistadas/i.exec(t))) k.push(['Entrevistas', m[1] + (/cara a cara/i.test(t) ? ' cara a cara' : '')]);
    if ((m = /error muestral\D{0,40}?(\d+,\d+)/i.exec(t))) k.push(['Error muestral', '±' + m[1] + ' puntos']);
    if ((m = /tasa de respuesta\D{0,40}?(\d+,\d+)\s*%/i.exec(t))) k.push(['Tasa de respuesta', m[1] + '%']);
    return k.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1].trim()) + '</dd></div>'; }).join('');
  }

  get('surveys?per_page=1&_fields=id,link,title,acf,_links,_embedded&_embed=wp:featuredmedia').then(function (xs) {
    var s = xs && xs[0], a = (s && s.acf) || {}, m = /(\d{1,4})/.exec(String(a.numero || '')), n = m ? +m[1] : 0;
    if (!n || n <= +feat.dataset.num) return;
    var title = txt(s.title.rendered), link = s.link, fecha = a.fecha_encuesta || '';
    var h = feat.querySelector('h2 a'), old = h.getAttribute('href');
    feat.querySelectorAll('a').forEach(function (x) { if (x.getAttribute('href') === old) x.href = link; });
    h.textContent = title;
    var kick = feat.querySelector('.kicker'); if (kick && fecha) kick.innerHTML = 'Última medición <span>|</span> ' + esc(fecha);
    var img = feat.querySelector('.thumb img'), md = s._embedded && s._embedded['wp:featuredmedia'] && s._embedded['wp:featuredmedia'][0];
    if (img && md && md.source_url) { var sz = (md.media_details && md.media_details.sizes) || {}; img.src = (sz.large || sz.medium_large || md).source_url; }
    feat.dataset.num = n;

    var tb = document.querySelector('table.surveys tbody');
    if (tb && tb.rows[0] && tb.rows[0].cells[0].textContent.replace(/\D/g, '') !== String(n))
      tb.insertRow(0).innerHTML = '<td>N° ' + n + '</td><td><a href="' + esc(link) + '">' + esc(title) + '</a></td><td>' + esc(fecha) + '</td>';

    var mods = a.contenido_flexible || [];
    var block = mods.filter(function (b) { return /Población objetivo|error muestral|Datos de la muestra/i.test(b.texto_enriquecido || ''); })[0];
    var all = block ? items(block.texto_enriquecido) : [], key = feat.querySelector('.ficha-key'), kh = all.length ? keys(all) : '';
    if (key) { key.innerHTML = kh; key.hidden = !kh; }
    if (!ficha) return;
    if (!all.length) { ficha.hidden = true; feat.querySelectorAll('a[href="#ficha"]').forEach(function (x) { x.hidden = true; }); return; }
    ficha.querySelector('summary').textContent = 'Ficha técnica · Encuesta CEP N° ' + n;
    ficha.querySelector('.ficha-dl').innerHTML = all.map(function (i) {
      return '<div><dt>' + esc(i.k.replace(/:\s*$/, '')) + '</dt><dd>' + i.v.map(esc).join('<br>') + '</dd></div>';
    }).join('');
    var src = ficha.querySelector('.ficha-src');
    if (src) src.innerHTML = 'Fuente: <a href="' + esc(link) + '">' + esc(title) + '</a> · <a href="https://www.cepchile.cl/opinion-publica/encuesta-cep/sobre-encuesta-cep/metodologia/">Metodología</a> · <a href="../datos/">Base de datos y documentación</a>';
    var files = [].concat.apply([], mods.map(function (b) { return b.archivos || []; }));
    var man = files.filter(function (f) { return /manual/i.test(f.titulo || ''); })[0];
    if (src && man && man.archivo) get('media/' + (+man.archivo) + '?_fields=source_url').then(function (f) {
      if (f && f.source_url) src.insertAdjacentHTML('beforeend', ' · <a href="' + esc(f.source_url) + '">Manual de usuario</a> (PDF)');
    }).catch(function () {});
  }).catch(function () {});
})();
