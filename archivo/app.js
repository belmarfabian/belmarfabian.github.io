(() => {
  const feed = document.getElementById('feed');
  const tpl = document.getElementById('tpl-articulo');
  const input = document.getElementById('q');
  const conteo = document.getElementById('conteo');
  const vacio = document.getElementById('vacio');
  const fin = document.getElementById('fin');
  const centinela = document.getElementById('centinela');
  const subbar = document.getElementById('subbar');
  const tagbar = document.getElementById('tagbar');
  const chipsSeccion = document.querySelectorAll('.filtros .chip');

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
    scholar: 'Google Scholar',
    openalex: 'OpenAlex',
    crossref: 'Crossref',
    academia: 'Academia.edu',
    ciper: 'CIPER Chile',
    cep: 'CEP Chile',
    substack: 'Substack',
    uai: 'UAI',
    otros: 'Otros',
    utprensa: 'Reporte de Prensa UTalca',
  };
  const PAGE = 5;

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
    if (c.seccion === 'academico') return String(y);
    return FMT_FECHA.format(new Date(y, (m || 1) - 1, d || 1));
  }

  function normaliza(s) {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
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
    // Cuenta cuántas entradas tendría cada tag respetando seccion+fuente+q (no tag)
    const q = normaliza(state.q.trim());
    const cnt = new Map();
    for (const c of state.todas) {
      if (state.seccion !== 'todas' && c.seccion !== state.seccion) continue;
      if (state.fuente !== 'todas' && c.fuente !== state.fuente) continue;
      if (q) {
        const blob = normaliza(
          c.titulo + ' ' + (c.bajada || '') + ' ' + (c.parrafos || []).join(' ')
        );
        if (!blob.includes(q)) continue;
      }
      if (!Array.isArray(c.tags)) continue;
      for (const t of c.tags) cnt.set(t, (cnt.get(t) || 0) + 1);
    }
    return [...cnt.entries()].sort((a, b) => b[1] - a[1]);
  }

  function renderTagbar() {
    const ranking = tagsConteoEnContexto();
    if (!ranking.length) {
      tagbar.replaceChildren();
      return;
    }
    const TOPN = 12;
    const visibles = state.expandirTags ? ranking : ranking.slice(0, TOPN);
    tagbar.replaceChildren();

    const lab = document.createElement('span');
    lab.className = 'tagbar__label';
    lab.textContent = 'Tags';
    tagbar.appendChild(lab);

    if (state.tag) {
      const todos = document.createElement('button');
      todos.className = 'tagbar__more';
      todos.textContent = '× quitar tag';
      todos.addEventListener('click', () => {
        state.tag = '';
        aplicarFiltros();
      });
      tagbar.appendChild(todos);
    }

    for (const [t, n] of visibles) {
      const b = document.createElement('button');
      b.className = 'tagbar__tag' + (state.tag === t ? ' activo' : '');
      b.innerHTML = `${t}<span class="count">${n}</span>`;
      b.addEventListener('click', () => {
        state.tag = (state.tag === t ? '' : t);
        aplicarFiltros();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      tagbar.appendChild(b);
    }

    if (ranking.length > TOPN && !state.expandirTags) {
      const more = document.createElement('button');
      more.className = 'tagbar__more';
      more.textContent = `+${ranking.length - TOPN} más…`;
      more.addEventListener('click', () => {
        state.expandirTags = true;
        renderTagbar();
      });
      tagbar.appendChild(more);
    }
  }

  function renderSubbar() {
    const fuentes = fuentesDisponibles();
    if (fuentes.length <= 1) {
      subbar.replaceChildren();
      return;
    }
    const items = [['todas', 'Todas las fuentes']].concat(
      fuentes.map(f => [f, NOMBRE_FUENTE[f] || f])
    );
    subbar.replaceChildren();
    for (const [key, label] of items) {
      const b = document.createElement('button');
      b.className = 'pill' + (state.fuente === key ? ' activo' : '');
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
      const blob = normaliza(
        c.titulo + ' ' + (c.bajada || '') + ' ' + (c.parrafos || []).join(' ')
      );
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
    if (f === total) {
      conteo.textContent = `${total} entradas`;
    } else {
      conteo.textContent = `${f} de ${total}`;
    }
  }

  const FALLBACK_IMG = 'fabian.jpg';

  function pintar(c) {
    const node = tpl.content.cloneNode(true);
    const post = node.querySelector('.post');
    post.dataset.id = c.id;
    post.dataset.fuente = c.fuente;
    if (c.seccion === 'academico') post.classList.add('academico');
    if (!c.cuerpo_html) post.classList.add('sin-cuerpo');

    const aImg = node.querySelector('.post__imagen');
    const img = node.querySelector('.post__imagen img');
    aImg.href = c.url;

    if (c.seccion === 'academico' && !c.imagen) {
      // Thumbnail generado: año + tipo + fuente
      img.remove();
      const thumb = document.createElement('div');
      thumb.className = 'post__thumb-academico';
      const yr = (c.fecha || '').slice(0, 4) || 's/f';
      const tipoLabel = NOMBRE_TIPO[c.tipo] || 'Paper';
      thumb.innerHTML = `
        <span class="ta-año">${yr}</span>
        <span class="ta-tipo">${tipoLabel}</span>
        <span class="ta-fuente">${NOMBRE_FUENTE[c.fuente] || c.fuente}</span>
      `;
      aImg.appendChild(thumb);
    } else if (c.seccion === 'prensa' && !c.imagen) {
      // Thumbnail generado para prensa: nombre del medio en grande
      img.remove();
      const medio = (c.bajada || 'Aparición').replace(/\.$/, '');
      const thumb = document.createElement('div');
      thumb.className = 'post__thumb-prensa';
      thumb.innerHTML = `
        <span class="tp-medio">${medio}</span>
        <span class="tp-tipo">Aparición</span>
      `;
      aImg.appendChild(thumb);
    } else {
      const src = c.imagen || FALLBACK_IMG;
      img.src = src;
      img.alt = c.titulo;
      img.addEventListener('error', () => {
        if (img.src !== FALLBACK_IMG && !img.src.endsWith('/' + FALLBACK_IMG)) {
          img.src = FALLBACK_IMG;
        }
      }, { once: true });
    }

    const fecha = node.querySelector('.post__fecha');
    const t = fechaLegible(c);
    if (t) {
      fecha.dateTime = c.fecha;
      fecha.textContent = t;
    } else {
      const sep = fecha.nextElementSibling;
      fecha.remove();
      if (sep && sep.classList.contains('post__sep')) sep.remove();
    }

    node.querySelector('.post__tipo').textContent = NOMBRE_TIPO[c.tipo] || 'Nota';

    const fav = node.querySelector('.post__favicon');
    fav.src = `fav-${c.fuente}.png`;
    fav.addEventListener('error', () => fav.remove(), { once: true });
    node.querySelector('.post__fuente-nombre').textContent =
      NOMBRE_FUENTE[c.fuente] || c.fuente;

    const tituloA = node.querySelector('.post__titulo a');
    tituloA.textContent = c.titulo;
    tituloA.href = c.url;

    const excerpt = node.querySelector('.post__excerpt');
    excerpt.textContent = previewTexto(c) || '';

    const orig = node.querySelector('.post__original');
    orig.href = c.url;
    orig.textContent = (c.seccion === 'academico'
      ? `Ver paper en ${NOMBRE_FUENTE[c.fuente] || c.fuente} »`
      : `Leer en ${NOMBRE_FUENTE[c.fuente] || c.fuente} »`);

    // Tags inline (máximo 6)
    const ul = node.querySelector('.post__tags');
    const tagList = (c.tags || []).slice(0, 6);
    for (const t of tagList) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        state.tag = t;
        aplicarFiltros();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      li.appendChild(b);
      ul.appendChild(li);
    }

    feed.appendChild(node);
  }

  // Detecta bajadas que son plantilla del medio y no aportan info real
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
    // Académicos: bajada (abstract) o venue
    if (c.seccion === 'academico') return (c.bajada || '').trim();
    // Columnas: preferir primer párrafo del cuerpo; si no hay, usar bajada que NO sea plantilla
    if (Array.isArray(c.parrafos) && c.parrafos.length) {
      return truncar(c.parrafos[0], 280);
    }
    if (c.bajada && !esBajadaPlantilla(c.bajada)) {
      return truncar(c.bajada, 280);
    }
    return '';
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
        chipsSeccion.forEach(c => c.classList.remove('activo'));
        chip.classList.add('activo');
        state.seccion = chip.dataset.seccion;
        state.tag = '';
        state.expandirTags = false;
        // resetear fuente: si la seleccionada ya no aplica, vuelve a "todas"
        const disp = fuentesDisponibles();
        if (state.fuente !== 'todas' && !disp.includes(state.fuente)) {
          state.fuente = 'todas';
        }
        renderSubbar();
        aplicarFiltros();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  async function init() {
    try {
      const r = await fetch('entradas.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      const items = data.items || data.columnas || [];
      state.todas = items.slice().sort((a, b) =>
        (b.fecha || '0000-00-00').localeCompare(a.fecha || '0000-00-00')
      );
    } catch (e) {
      conteo.textContent = 'No se pudo cargar entradas.json. Sirve esta carpeta con un servidor.';
      console.error(e);
      return;
    }
    bind();
    renderSubbar();
    aplicarFiltros();
  }

  init();
})();
