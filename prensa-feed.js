/* Renderiza prensa + columnas dentro de #panel-prensa como cards con imagen.
   Estilo coherente con el sitio principal (Roboto Mono, paleta Bauhaus).
   Filtros internos por sección/medio/tag y escucha la búsqueda global. */
(() => {
  const root = document.getElementById('panel-prensa');
  if (!root) return;

  const feed = document.getElementById('pf-feed');
  const tpl = document.getElementById('tpl-pf-articulo');
  const pillsBox = document.getElementById('pf-pills');
  const tagsBox = document.getElementById('pf-tags');
  const vacio = document.getElementById('pf-vacio');
  const conteo = document.getElementById('pf-conteo');
  const chipsSeccion = root.querySelectorAll('.pf-chip');
  const tabBtn = document.querySelector('.tab[data-tab="prensa"]');
  let tabBadge = tabBtn ? tabBtn.querySelector('.tab-count') : null;
  const globalSearch = document.querySelector('.search-input');

  const FMT_FECHA = new Intl.DateTimeFormat('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const NOMBRE_TIPO = {
    columna: 'Columna',
    analisis: 'Análisis',
    paper: 'Paper',
    proyecto: 'Proyecto',
    video: 'Video',
    aparicion: 'Aparición',
    otro: 'Nota',
  };
  const NOMBRE_FUENTE = {
    ciper: 'CIPER Chile',
    cep: 'CEP Chile',
    substack: 'Substack',
    uai: 'UAI',
    otros: 'Otros',
    utprensa: 'Reporte de Prensa UTalca',
  };
  const ASSET_BASE = 'archivo/';
  const FALLBACK_IMG = ASSET_BASE + 'fabian.jpg';

  const state = {
    todas: [],
    seccion: 'todas',
    fuente: 'todas',
    tag: '',
    q: '',
    expandirTags: false,
  };

  function fechaLegible(c) {
    if (!c.fecha) return '';
    const [y, m, d] = c.fecha.split('-').map(Number);
    if (!y) return '';
    return FMT_FECHA.format(new Date(y, (m || 1) - 1, d || 1));
  }

  function normaliza(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function esDominio(s) { return !s.includes(' ') && /\.[a-zA-Z]{2,}$/.test(s); }
  function aTitleCase(s) {
    return s.toLowerCase().replace(/(^|\s|«|"|')([\wáéíóúñ])/g, function (_, sp, c) {
      return sp + c.toUpperCase();
    });
  }
  function medioDe(c) {
    if (c.seccion === 'prensa' && c.bajada) {
      let m = c.bajada.replace(/\.$/, '').trim();
      if (m.includes('·')) m = m.split('·')[0].trim();
      if (m && m.length < 80) {
        if (esDominio(m)) return m.toLowerCase();
        if (m.length > 3 && m === m.toUpperCase()) return aTitleCase(m);
        return m;
      }
    }
    return NOMBRE_FUENTE[c.fuente] || c.fuente;
  }

  function fuentesDisponibles() {
    const set = new Set();
    for (const c of state.todas) {
      if (state.seccion === 'todas' || c.seccion === state.seccion) {
        set.add(c.fuente);
      }
    }
    return [...set];
  }

  function tagsConteoEnContexto() {
    const cnt = new Map();
    for (const c of state.todas) {
      if (state.seccion !== 'todas' && c.seccion !== state.seccion) continue;
      if (state.fuente !== 'todas' && c.fuente !== state.fuente) continue;
      if (!Array.isArray(c.tags)) continue;
      for (const t of c.tags) cnt.set(t, (cnt.get(t) || 0) + 1);
    }
    return [...cnt.entries()].sort((a, b) => b[1] - a[1]);
  }

  function matchesQuery(c, q) {
    if (!q) return true;
    const blob = normaliza(c.titulo + ' ' + (c.bajada || '') + ' ' + (c.parrafos || []).join(' ') + ' ' + (c.tags || []).join(' '));
    return blob.includes(q);
  }

  function aplicarFiltros() {
    const q = normaliza(state.q.trim());
    let visibles = 0;
    for (const post of feed.querySelectorAll('.pf-post')) {
      const id = post.dataset.id;
      const c = state.todas.find(x => x.id === id);
      if (!c) continue;
      let mostrar = true;
      if (state.seccion !== 'todas' && c.seccion !== state.seccion) mostrar = false;
      if (state.fuente !== 'todas' && c.fuente !== state.fuente) mostrar = false;
      if (state.tag && !(Array.isArray(c.tags) && c.tags.includes(state.tag))) mostrar = false;
      if (mostrar && !matchesQuery(c, q)) mostrar = false;
      post.classList.toggle('pf-hidden', !mostrar);
      if (mostrar) visibles++;
    }
    if (vacio) vacio.hidden = visibles > 0;
    if (conteo) {
      const total = state.todas.length;
      conteo.textContent = (visibles === total) ? `${total} entradas` : `${visibles} de ${total}`;
    }
    renderPills();
    renderTags();
  }

  function renderPills() {
    if (!pillsBox) return;
    const fuentes = fuentesDisponibles();
    pillsBox.replaceChildren();
    if (fuentes.length <= 1) return;
    const items = [['todas', 'Todas las fuentes']].concat(
      fuentes.map(f => [f, NOMBRE_FUENTE[f] || f])
    );
    for (const [key, label] of items) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pf-pill' + (state.fuente === key ? ' active' : '');
      b.textContent = label;
      b.addEventListener('click', () => { state.fuente = key; aplicarFiltros(); });
      pillsBox.appendChild(b);
    }
  }

  function renderTags() {
    if (!tagsBox) return;
    const ranking = tagsConteoEnContexto();
    tagsBox.replaceChildren();
    if (!ranking.length) return;
    const TOPN = 10;
    const visibles = state.expandirTags ? ranking : ranking.slice(0, TOPN);

    const lab = document.createElement('span');
    lab.className = 'pf-tags__label';
    lab.textContent = 'Tags';
    tagsBox.appendChild(lab);

    if (state.tag) {
      const quitar = document.createElement('button');
      quitar.type = 'button';
      quitar.className = 'pf-tag pf-tag--clear';
      quitar.textContent = '× quitar tag';
      quitar.addEventListener('click', () => { state.tag = ''; aplicarFiltros(); });
      tagsBox.appendChild(quitar);
    }

    for (const [t, n] of visibles) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pf-tag' + (state.tag === t ? ' active' : '');
      b.innerHTML = `${t} <span class="pf-tag__count">${n}</span>`;
      b.addEventListener('click', () => { state.tag = (state.tag === t ? '' : t); aplicarFiltros(); });
      tagsBox.appendChild(b);
    }

    if (ranking.length > TOPN && !state.expandirTags) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'pf-tag pf-tag--more';
      more.textContent = `+${ranking.length - TOPN} más…`;
      more.addEventListener('click', () => { state.expandirTags = true; renderTags(); });
      tagsBox.appendChild(more);
    }
  }

  function pintar(c) {
    const node = tpl.content.cloneNode(true);
    const post = node.querySelector('.pf-post');
    post.dataset.id = c.id;
    post.dataset.fuente = c.fuente;
    post.dataset.seccion = c.seccion;

    const aImg = node.querySelector('.pf-post__imagen');
    const img = node.querySelector('.pf-post__imagen img');
    aImg.href = c.url || '#';

    if (c.imagen && c.imagen.startsWith('http')) {
      img.src = c.imagen;
      img.alt = c.titulo;
      img.addEventListener('error', () => generarThumb(aImg, img, c), { once: true });
    } else {
      generarThumb(aImg, img, c);
    }

    const fecha = node.querySelector('.pf-post__fecha');
    const t = fechaLegible(c);
    if (t) {
      fecha.dateTime = c.fecha;
      fecha.textContent = t;
    } else {
      const sep = fecha.nextElementSibling;
      fecha.remove();
      if (sep && sep.classList.contains('pf-post__sep')) sep.remove();
    }

    node.querySelector('.pf-post__tipo').textContent = NOMBRE_TIPO[c.tipo] || 'Nota';
    node.querySelector('.pf-post__medio').textContent = medioDe(c);

    const tituloA = node.querySelector('.pf-post__titulo a');
    tituloA.textContent = c.titulo;
    tituloA.href = c.url || '#';

    const excerpt = node.querySelector('.pf-post__excerpt');
    excerpt.textContent = previewTexto(c) || '';
    if (!excerpt.textContent) excerpt.remove();

    const ul = node.querySelector('.pf-post__tags');
    const tagList = (c.tags || []).slice(0, 5);
    for (const tg of tagList) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = tg;
      b.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        state.tag = tg;
        aplicarFiltros();
      });
      li.appendChild(b);
      ul.appendChild(li);
    }
    if (!tagList.length) ul.remove();

    feed.appendChild(node);
  }

  function generarThumb(aImg, img, c) {
    if (img && img.parentNode) img.remove();
    const thumb = document.createElement('div');
    thumb.className = 'pf-thumb pf-thumb--' + c.seccion;
    const medio = medioDe(c);
    const año = (c.fecha || '').slice(0, 4);
    thumb.innerHTML = `
      <span class="pf-thumb__medio">${medio}</span>
      ${año ? `<span class="pf-thumb__año">${año}</span>` : ''}
    `;
    aImg.appendChild(thumb);
  }

  const PATRONES_TEMPLATE = [
    /^revisa en detalle la columna/i,
    /^revisa la columna/i,
    /^revisa el an[aá]lisis/i,
    /columna dominical del doctor en ciencia pol[ií]tica/i,
    /profesor titular de la universidad de talca/i,
    /^lee\s+["“]/i,
  ];
  function esBajadaPlantilla(s) {
    if (!s) return true;
    return PATRONES_TEMPLATE.some(re => re.test(s));
  }
  function truncar(s, n) {
    if (!s) return '';
    s = s.trim();
    if (s.length <= n) return s;
    return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
  }
  function previewTexto(c) {
    if (Array.isArray(c.parrafos) && c.parrafos.length) return truncar(c.parrafos[0], 220);
    if (c.bajada && !esBajadaPlantilla(c.bajada) && !esDominio(c.bajada.replace(/\.$/, '').trim())) {
      return truncar(c.bajada, 220);
    }
    return '';
  }

  function bind() {
    chipsSeccion.forEach(chip => {
      chip.addEventListener('click', () => {
        chipsSeccion.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.seccion = chip.dataset.pfSeccion;
        state.tag = '';
        state.expandirTags = false;
        const disp = fuentesDisponibles();
        if (state.fuente !== 'todas' && !disp.includes(state.fuente)) state.fuente = 'todas';
        aplicarFiltros();
      });
    });

    // Sincronizar con la búsqueda global del sitio (debounced)
    if (globalSearch) {
      let t;
      const sync = () => {
        clearTimeout(t);
        t = setTimeout(() => {
          state.q = globalSearch.value;
          aplicarFiltros();
        }, 120);
      };
      globalSearch.addEventListener('input', sync);
    }
  }

  let resolveReady;
  window.__prensaFeedReady = new Promise(res => { resolveReady = res; });

  async function init() {
    try {
      const r = await fetch(ASSET_BASE + 'entradas.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      const items = (data.items || data.columnas || []).filter(c =>
        (c.seccion === 'prensa' || c.seccion === 'columnas')
        && c.fuente !== 'cep'
        && c.fecha
      );
      state.todas = items.slice().sort((a, b) =>
        (b.fecha || '0000-00-00').localeCompare(a.fecha || '0000-00-00')
      );
    } catch (e) {
      if (vacio) {
        vacio.hidden = false;
        vacio.textContent = 'No se pudo cargar el archivo de entradas.';
      }
      console.error(e);
      resolveReady([]);
      return;
    }

    feed.replaceChildren();
    state.todas.forEach(pintar);
    bind();
    aplicarFiltros();

    if (tabBtn && !tabBadge) {
      tabBadge = document.createElement('span');
      tabBadge.className = 'tab-count';
      tabBtn.appendChild(tabBadge);
    }
    if (tabBadge) tabBadge.textContent = state.todas.length;

    resolveReady(state.todas);
  }

  init();
})();
