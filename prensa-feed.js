/* Renderiza prensa + columnas dentro de #panel-prensa con el mismo formato
   que las demás pestañas (ol.scrollable-list con li tipo cita). Filtros
   internos por sección/medio/tag ocultan items mediante .feed-hidden. */
(() => {
  const root = document.getElementById('panel-prensa');
  if (!root) return;

  const list = document.getElementById('pf-list');
  const pillsBox = document.getElementById('pf-pills');
  const tagsBox = document.getElementById('pf-tags');
  const vacio = document.getElementById('pf-vacio');
  const chipsSeccion = root.querySelectorAll('.pf-chip');
  const tabBtn = document.querySelector('.tab[data-tab="prensa"]');
  let tabBadge = tabBtn ? tabBtn.querySelector('.tab-count') : null;

  const NOMBRE_FUENTE = {
    ciper: 'CIPER Chile',
    cep: 'CEP Chile',
    substack: 'Substack',
    uai: 'UAI',
    otros: 'Otros',
    utprensa: 'Reporte de Prensa UTalca',
  };

  const state = {
    todas: [],
    seccion: 'todas',
    fuente: 'todas',
    tag: '',
    expandirTags: false,
  };

  function añoDe(c) { return (c.fecha || '').slice(0, 4); }

  function esDominio(s) {
    return !s.includes(' ') && /\.[a-zA-Z]{2,}$/.test(s);
  }

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
        // Todo mayúsculas → Title Case ("LAS ÚLTIMAS NOTICIAS" → "Las Últimas Noticias")
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

  function aplicarFiltros() {
    let visibles = 0;
    for (const li of list.querySelectorAll('li')) {
      const sec = li.dataset.pfSeccion;
      const fnt = li.dataset.pfFuente;
      const tgs = (li.dataset.pfTags || '').split('|').filter(Boolean);

      let mostrar = true;
      if (state.seccion !== 'todas' && sec !== state.seccion) mostrar = false;
      if (state.fuente !== 'todas' && fnt !== state.fuente) mostrar = false;
      if (state.tag && !tgs.includes(state.tag)) mostrar = false;

      li.classList.toggle('feed-hidden', !mostrar);
      if (mostrar) visibles++;
    }
    if (vacio) vacio.hidden = visibles > 0;
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
      b.addEventListener('click', () => {
        state.fuente = key;
        aplicarFiltros();
      });
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
      b.addEventListener('click', () => {
        state.tag = (state.tag === t ? '' : t);
        aplicarFiltros();
      });
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

  function escapeHtml(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderLista() {
    list.replaceChildren();
    state.todas.forEach((c, idx) => {
      const li = document.createElement('li');
      li.dataset.pfId = c.id;
      li.dataset.pfSeccion = c.seccion;
      li.dataset.pfFuente = c.fuente;
      li.dataset.pfFecha = c.fecha || '';
      li.dataset.pfTags = (c.tags || []).join('|');

      const año = añoDe(c);
      const titulo = escapeHtml(c.titulo);
      const medio = escapeHtml(medioDe(c));
      const url = escapeHtml(c.url || '');
      const link = url
        ? ` <a href="${url}" target="_blank" rel="noopener">Enlace</a>`
        : '';
      const añoTxt = año ? ` (${año})` : '';

      li.innerHTML = `<strong>Belmar, F.</strong>${añoTxt}. ${titulo}. <em>${medio}</em>.${link}`;
      list.appendChild(li);
    });

    // Numeración descendente (igual que las demás listas)
    if (state.todas.length) {
      list.setAttribute('start', String(state.todas.length));
      list.setAttribute('reversed', '');
    }
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
        if (state.fuente !== 'todas' && !disp.includes(state.fuente)) {
          state.fuente = 'todas';
        }
        aplicarFiltros();
      });
    });
  }

  let resolveReady;
  window.__prensaFeedReady = new Promise(res => { resolveReady = res; });

  async function init() {
    try {
      const r = await fetch('archivo/entradas.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      const items = (data.items || data.columnas || []).filter(c =>
        (c.seccion === 'prensa' || c.seccion === 'columnas')
        && c.fuente !== 'cep'   // los CEP son Informes C22, ya en pestaña Documentos
        && c.fecha               // requiere fecha para ordenar y mostrar año
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

    renderLista();
    bind();
    aplicarFiltros();

    // Crear el badge si no existía y actualizar conteo
    if (tabBtn && !tabBadge) {
      tabBadge = document.createElement('span');
      tabBadge.className = 'tab-count';
      tabBtn.appendChild(tabBadge);
    }
    if (tabBadge) tabBadge.textContent = state.todas.length;

    // Re-indexar la búsqueda global del sitio para que también encuentre estos items
    if (typeof window.__rebuildSearchIndex === 'function') {
      window.__rebuildSearchIndex();
    }

    resolveReady(state.todas);
  }

  init();
})();
