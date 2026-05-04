/* Feed embebido en la pestaña "Prensa y columnas" del sitio principal.
   Lee archivo/entradas.json y muestra solo seccion = 'prensa' o 'columnas'. */
(() => {
  const root = document.getElementById('panel-prensa');
  if (!root) return;

  const feed = document.getElementById('pf-feed');
  const tpl = document.getElementById('tpl-pf-articulo');
  const input = document.getElementById('pf-q');
  const conteo = document.getElementById('pf-conteo');
  const vacio = document.getElementById('pf-vacio');
  const fin = document.getElementById('pf-fin');
  const centinela = document.getElementById('pf-centinela');
  const subbar = document.getElementById('pf-subbar');
  const tagbar = document.getElementById('pf-tagbar');
  const chipsSeccion = root.querySelectorAll('.pf-chip');
  const tabBtn = document.querySelector('.tab[data-tab="prensa"]');
  let tabBadge = tabBtn ? tabBtn.querySelector('.tab-count') : null;
  if (tabBtn && !tabBadge) {
    tabBadge = document.createElement('span');
    tabBadge.className = 'tab-count';
    tabBtn.appendChild(tabBadge);
  }

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
  const PAGE = 6;
  const ASSET_BASE = 'archivo/';
  const FALLBACK_IMG = ASSET_BASE + 'fabian.jpg';

  const state = {
    todas: [],
    filtradas: [],
    seccion: 'todas',
    fuente: 'todas',
    tag: '',
    q: '',
    cargadas: 0,
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
    const q = normaliza(state.q.trim());
    const cnt = new Map();
    for (const c of state.todas) {
      if (state.seccion !== 'todas' && c.seccion !== state.seccion) continue;
      if (state.fuente !== 'todas' && c.fuente !== state.fuente) continue;
      if (q) {
        const blob = normaliza(c.titulo + ' ' + (c.bajada || '') + ' ' + (c.parrafos || []).join(' '));
        if (!blob.includes(q)) continue;
      }
      if (!Array.isArray(c.tags)) continue;
      for (const t of c.tags) cnt.set(t, (cnt.get(t) || 0) + 1);
    }
    return [...cnt.entries()].sort((a, b) => b[1] - a[1]);
  }

  function renderTagbar() {
    const ranking = tagsConteoEnContexto();
    tagbar.replaceChildren();
    if (!ranking.length) return;

    const TOPN = 10;
    const visibles = state.expandirTags ? ranking : ranking.slice(0, TOPN);

    const lab = document.createElement('span');
    lab.className = 'pf-tagbar__label';
    lab.textContent = 'Tags';
    tagbar.appendChild(lab);

    if (state.tag) {
      const quitar = document.createElement('button');
      quitar.className = 'pf-tagbar__more';
      quitar.textContent = '× quitar tag';
      quitar.addEventListener('click', () => { state.tag = ''; aplicarFiltros(); });
      tagbar.appendChild(quitar);
    }

    for (const [t, n] of visibles) {
      const b = document.createElement('button');
      b.className = 'pf-tagbar__tag' + (state.tag === t ? ' active' : '');
      b.innerHTML = `${t}<span class="pf-count">${n}</span>`;
      b.addEventListener('click', () => {
        state.tag = (state.tag === t ? '' : t);
        aplicarFiltros();
      });
      tagbar.appendChild(b);
    }

    if (ranking.length > TOPN && !state.expandirTags) {
      const more = document.createElement('button');
      more.className = 'pf-tagbar__more';
      more.textContent = `+${ranking.length - TOPN} más…`;
      more.addEventListener('click', () => { state.expandirTags = true; renderTagbar(); });
      tagbar.appendChild(more);
    }
  }

  function renderSubbar() {
    const fuentes = fuentesDisponibles();
    subbar.replaceChildren();
    if (fuentes.length <= 1) return;
    const items = [['todas', 'Todas las fuentes']].concat(
      fuentes.map(f => [f, NOMBRE_FUENTE[f] || f])
    );
    for (const [key, label] of items) {
      const b = document.createElement('button');
      b.className = 'pf-pill' + (state.fuente === key ? ' active' : '');
      b.textContent = label;
      b.dataset.fuente = key;
      b.addEventListener('click', () => {
        state.fuente = key;
        renderSubbar();
        aplicarFiltros();
      });
      subbar.appendChild(b);
    }
  }

  function aplicarFiltros() {
    const q = normaliza(state.q.trim());
    state.filtradas = state.todas.filter(c => {
      if (state.seccion !== 'todas' && c.seccion !== state.seccion) return false;
      if (state.fuente !== 'todas' && c.fuente !== state.fuente) return false;
      if (state.tag && !(Array.isArray(c.tags) && c.tags.includes(state.tag))) return false;
      if (!q) return true;
      const blob = normaliza(c.titulo + ' ' + (c.bajada || '') + ' ' + (c.parrafos || []).join(' '));
      return blob.includes(q);
    });
    state.cargadas = 0;
    feed.replaceChildren();
    fin.hidden = true;
    vacio.hidden = state.filtradas.length > 0;
    actualizarConteo();
    renderTagbar();
    cargarSiguiente();
  }

  function actualizarConteo() {
    const total = state.todas.length;
    const f = state.filtradas.length;
    conteo.textContent = (f === total) ? `${total} entradas` : `${f} de ${total}`;
  }

  const PATRONES_TEMPLATE = [
    /^revisa en detalle la columna/i,
    /^revisa la columna/i,
    /^revisa el an[aá]lisis/i,
    /columna dominical del doctor en ciencia pol[ií]tica/i,
    /profesor titular de la universidad de talca/i,
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
    if (Array.isArray(c.parrafos) && c.parrafos.length) return truncar(c.parrafos[0], 240);
    if (c.bajada && !esBajadaPlantilla(c.bajada)) return truncar(c.bajada, 240);
    return '';
  }

  function pintar(c) {
    const node = tpl.content.cloneNode(true);
    const post = node.querySelector('.pf-post');
    post.dataset.id = c.id;
    post.dataset.fuente = c.fuente;
    if (!c.cuerpo_html) post.classList.add('pf-sin-cuerpo');

    const aImg = node.querySelector('.pf-post__imagen');
    const img = node.querySelector('.pf-post__imagen img');
    aImg.href = c.url;

    if (c.seccion === 'prensa' && !c.imagen) {
      img.remove();
      const medio = (c.bajada || 'Aparición').replace(/\.$/, '');
      const thumb = document.createElement('div');
      thumb.className = 'pf-post__thumb-prensa';
      thumb.innerHTML = `
        <span class="pf-tp-medio">${medio}</span>
        <span class="pf-tp-tipo">Aparición</span>
      `;
      aImg.appendChild(thumb);
    } else {
      const src = c.imagen ? (c.imagen.startsWith('http') ? c.imagen : ASSET_BASE + c.imagen) : FALLBACK_IMG;
      img.src = src;
      img.alt = c.titulo;
      img.addEventListener('error', () => {
        if (!img.src.endsWith(FALLBACK_IMG)) img.src = FALLBACK_IMG;
      }, { once: true });
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

    const fav = node.querySelector('.pf-post__favicon');
    fav.src = ASSET_BASE + `fav-${c.fuente}.png`;
    fav.addEventListener('error', () => fav.remove(), { once: true });
    node.querySelector('.pf-post__fuente-nombre').textContent = NOMBRE_FUENTE[c.fuente] || c.fuente;

    const tituloA = node.querySelector('.pf-post__titulo a');
    tituloA.textContent = c.titulo;
    tituloA.href = c.url;

    const excerpt = node.querySelector('.pf-post__excerpt');
    excerpt.textContent = previewTexto(c) || '';

    const orig = node.querySelector('.pf-post__original');
    orig.href = c.url;
    orig.textContent = `Leer en ${NOMBRE_FUENTE[c.fuente] || c.fuente} »`;

    const ul = node.querySelector('.pf-post__tags');
    const tagList = (c.tags || []).slice(0, 6);
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

    feed.appendChild(node);
  }

  function cargarSiguiente() {
    const restante = state.filtradas.slice(state.cargadas, state.cargadas + PAGE);
    for (const c of restante) pintar(c);
    state.cargadas += restante.length;
    if (state.cargadas >= state.filtradas.length) {
      fin.hidden = false;
      io.unobserve(centinela);
    } else {
      fin.hidden = true;
      io.observe(centinela);
    }
  }

  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) cargarSiguiente();
    }
  }, { rootMargin: '600px 0px' });

  function bind() {
    let tQ;
    input.addEventListener('input', e => {
      state.q = e.target.value;
      clearTimeout(tQ);
      tQ = setTimeout(aplicarFiltros, 120);
    });

    chipsSeccion.forEach(chip => {
      chip.addEventListener('click', () => {
        chipsSeccion.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.seccion = chip.dataset.pfSeccion;
        state.tag = '';
        state.expandirTags = false;
        const disp = fuentesDisponibles();
        if (state.fuente !== 'todas' && !disp.includes(state.fuente)) {
          state.fuente = 'todas';
        }
        renderSubbar();
        aplicarFiltros();
      });
    });
  }

  // Promesa global para que script.js (timeline) pueda usar los mismos datos.
  let resolveReady;
  window.__prensaFeedReady = new Promise(res => { resolveReady = res; });

  async function init() {
    try {
      const r = await fetch(ASSET_BASE + 'entradas.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      const items = (data.items || data.columnas || [])
        .filter(c => c.seccion === 'prensa' || c.seccion === 'columnas');
      state.todas = items.slice().sort((a, b) =>
        (b.fecha || '0000-00-00').localeCompare(a.fecha || '0000-00-00')
      );
    } catch (e) {
      conteo.textContent = 'No se pudo cargar el archivo de entradas.';
      console.error(e);
      resolveReady([]);
      return;
    }
    bind();
    renderSubbar();
    aplicarFiltros();

    // Actualizar badge de la pestaña con el total
    if (tabBadge) tabBadge.textContent = state.todas.length;

    resolveReady(state.todas);
  }

  init();
})();
