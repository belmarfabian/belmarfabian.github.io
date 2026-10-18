(function () {
  "use strict";

  var THESES = [
    { key: "Transformacional", var: "--t-trans" },
    { key: "Populista", var: "--t-pop" },
    { key: "Estructural", var: "--t-est" },
    { key: "Insurreccional", var: "--t-ins" },
    { key: "Otras lecturas", var: "--t-otr" }
  ];
  var Y0 = 2012, Y1 = 2026;
  var state = { on: {}, reg: "todos", ant: true, sel: null, q: "", scheme: "bellolio" };
  var CODES = [], CODE = {}, FAMS = [];
  THESES.forEach(function (t) { state.on[t.key] = true; });

  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  function color(th) { var t = THESES.find(function (x) { return x.key === th; }); return css(t ? t.var : "--t-otr"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var themeBtn = document.getElementById("themeBtn");
  function syncThemeBtn() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    themeBtn.textContent = dark ? "◑" : "◐";
    themeBtn.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  }
  themeBtn.addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncThemeBtn(); renderAll();
  });
  syncThemeBtn();

  var propose = document.getElementById("propose");
  propose.href = "https://github.com/belmarfabian/estallido-tesis/issues/new?template=nueva-obra.yml";

  var DATA = [];
  Promise.all([fetch("datos/tesis_estallido.json").then(function (r) { return r.json(); }),
               fetch("datos/libro_de_codigos.json").then(function (r) { return r.json(); })]).then(function (res) {
    var d = res[0];
    CODES = res[1];
    CODES.forEach(function (c) { CODE[c.codigo] = c; if (FAMS.indexOf(c.familia) < 0) FAMS.push(c.familia); });
    DATA = d.map(function (x) { x.anio = +x.anio; x.mecs = x.mecanismos ? x.mecanismos.split(";") : []; return x; });
    buildChips(); bind(); renderAll();
  }).catch(function () {
    document.getElementById("stats").textContent = "No se pudieron cargar los datos. Descarga el CSV desde el enlace de la tabla.";
  });

  function visible(d) {
    if (!state.on[d.tesis]) return false;
    if (state.reg !== "todos" && d.registro !== state.reg) return false;
    if (!state.ant && d.rol === "antecedente") return false;
    return true;
  }

  function buildChips() {
    var box = document.getElementById("chips");
    box.innerHTML = "";
    THESES.forEach(function (t) {
      var n = DATA.filter(function (d) { return d.tesis === t.key; }).length;
      var b = document.createElement("button");
      b.className = "chip"; b.type = "button";
      b.setAttribute("aria-pressed", state.on[t.key] ? "true" : "false");
      b.innerHTML = '<i style="background:' + color(t.key) + '"></i>' + esc(t.key) + ' <span style="color:var(--faint)">' + n + "</span>";
      b.addEventListener("click", function () { state.on[t.key] = !state.on[t.key]; b.setAttribute("aria-pressed", state.on[t.key]); renderAll(); });
      box.appendChild(b);
    });
  }

  function bind() {
    document.querySelectorAll(".segb").forEach(function (b) {
      b.addEventListener("click", function () {
        state.scheme = b.getAttribute("data-scheme");
        document.querySelectorAll(".segb").forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        renderAll();
      });
    });
    document.getElementById("reg").addEventListener("change", function (e) { state.reg = e.target.value; renderAll(); });
    document.getElementById("ant").addEventListener("change", function (e) { state.ant = e.target.checked; renderAll(); });
    document.getElementById("q").addEventListener("input", function (e) { state.q = e.target.value.toLowerCase(); renderTable(); });
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(renderAll, 150); });
  }

  function renderAll() {
    buildChipsColors(); renderStats(); renderCaption(); renderMap(); renderBars(); renderTable(); renderLegend();
  }
  function buildChipsColors() {
    document.querySelectorAll("#chips .chip i").forEach(function (el, i) { el.style.background = color(THESES[i].key); });
  }

  function renderStats() {
    var v = DATA.filter(visible);
    var subs = new Set(v.map(function (d) { return d.tesis + "|" + d.subcorriente; }));
    var cnt = function (r) { return v.filter(function (d) { return d.registro === r; }).length; };
    var authors = new Set(v.map(function (d) { return d.autores; }));
    document.getElementById("stats").textContent = v.length + " obras de " + authors.size + " autores o fuentes, " +
      subs.size + " subcorrientes. " + cnt("investigacion") + " son investigación, " + cnt("ensayo") + " son ensayo y " + cnt("opinion") + " son opinión o declaración.";
  }

  function renderCaption() {
    var c = document.getElementById("caption");
    if (state.scheme === "emergente") {
      c.textContent = "Figura 1. Matriz de obras por mecanismo causal, 2012–2026. Cada fila es un mecanismo y cada obra aparece en todos los mecanismos que invoca: en tono pleno si es su mecanismo principal y atenuado si es secundario. El color indica la tesis de la obra en la tipología de Bellolio (2026). La codificación es de elaboración propia, a partir de los textos y de reseñas. La línea punteada marca el 18 de octubre de 2019. Al pasar el cursor sobre una obra se muestra su referencia completa.";
    } else {
      c.textContent = "Figura 1. Mapa de las interpretaciones del estallido social, 2012–2026. Cada franja es una tesis de la tipología de Bellolio (2026) y cada fila, una subcorriente. La asignación de obras y las subcorrientes son de elaboración propia. Las obras que no calzan en las cuatro tesis van a «Otras lecturas». La línea punteada marca el 18 de octubre de 2019. Antes de 2019 la escala está comprimida. Al pasar el cursor sobre una obra se muestra su referencia completa.";
    }
  }

  function renderLegend() {
    var ink = css("--text-2"), bg = css("--bg");
    document.getElementById("legend").innerHTML =
      '<span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="6" fill="' + ink + '" fill-opacity=".24" stroke="' + ink + '" stroke-width="1.5"/></svg>Investigación (artículo arbitrado, monografía, encuesta)</span>' +
      '<span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="6" fill="' + ink + '" fill-opacity=".24" stroke="' + ink + '" stroke-dasharray="1.5 2" stroke-width="1.5"/></svg>Ensayo</span>' +
      '<span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="6" fill="' + bg + '" stroke="' + ink + '" stroke-dasharray="4 2.5" stroke-width="1.5"/></svg>Opinión o declaración</span>' +
      '<span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="2" fill="' + ink + '" fill-opacity=".24" stroke="' + ink + '" stroke-width="1.5"/></svg>Antecedente previo al 18-O</span>' +
      (state.scheme === "emergente"
        ? '<span><svg width="30" height="14" opacity=".5"><rect x="1" y="1" width="28" height="12" rx="6" fill="' + ink + '" fill-opacity=".24" stroke="' + ink + '" stroke-width="1.5"/></svg>Mecanismo secundario de la obra</span>'
        : '<span><svg width="30" height="14"><line x1="1" y1="7" x2="29" y2="7" stroke="' + ink + '" stroke-width="1.5"/></svg>Continuidad dentro de una subcorriente</span>');
  }

  function lanes() {
    var out = [];
    if (state.scheme === "emergente") {
      FAMS.forEach(function (fam) {
        var subs = [];
        CODES.filter(function (c) { return c.familia === fam; }).forEach(function (c) {
          var its = DATA.filter(function (d) { return visible(d) && d.mecs.indexOf(c.codigo) >= 0; });
          if (!its.length) return;
          subs.push({ name: c.mecanismo, code: c.codigo, line: css("--faint"), items: its,
            first: d3.min(its, function (d) { return d.anio; }), opinionOnly: false });
        });
        if (subs.length) out.push({ name: fam, color: css("--faint"), subs: subs });
      });
      return out;
    }
    THESES.map(function (t) { return t.key; }).forEach(function (gk) {
      var items = DATA.filter(function (d) { return d.tesis === gk && visible(d); });
      if (!items.length) return;
      var subs = [];
      items.forEach(function (d) { if (subs.indexOf(d.subcorriente) < 0) subs.push(d.subcorriente); });
      subs.sort(function (p, q) {
        var fa = d3.min(items.filter(function (d) { return d.subcorriente === p; }), function (d) { return d.anio; });
        var fb = d3.min(items.filter(function (d) { return d.subcorriente === q; }), function (d) { return d.anio; });
        return fa - fb || p.localeCompare(q);
      });
      out.push({ name: gk, color: color(gk), subs: subs.map(function (sn) {
        var its = items.filter(function (d) { return d.subcorriente === sn; });
        return { name: sn, line: color(gk), items: its, first: d3.min(its, function (d) { return d.anio; }),
          opinionOnly: its.every(function (d) { return d.registro === "opinion"; }) };
      }) });
    });
    return out;
  }

  var tip = document.getElementById("tip");
  function showTip(el, html, evt, host) {
    el.innerHTML = html; el.style.opacity = 1;
    var r = host.getBoundingClientRect();
    var x = evt.clientX - r.left + 14, y = evt.clientY - r.top + 12;
    if (x + 300 > r.width) x = evt.clientX - r.left - 310;
    el.style.left = Math.max(4, x) + "px"; el.style.top = y + "px";
  }
  function hideTip(el) { el.style.opacity = 0; }

  function shortName(d) {
    return d.etiqueta.replace(/\s*\(\d{4}\)\s*$/, "").replace("Encuesta Bicentenario UC", "Bicentenario UC");
  }

  var measureCtx = document.createElement("canvas").getContext("2d");
  function textW(t, size, weight) { measureCtx.font = (weight || 500) + " " + size + "px Inter, system-ui, sans-serif"; return measureCtx.measureText(t).width; }

  function renderMap() {
    var svg = d3.select("#map"); svg.selectAll("g,line,rect,path,text:not(title):not(desc)").remove();
    var L = lanes();
    var labelW = state.scheme === "emergente" ? 228 : 190, preW = 200, gapW = 34, yearW = 145, padR = 20, top = 84, pillH = 22, pillGap = 5, lanePad = 9, bandPad = 10, bandGap = 8;
    var yearsPost = d3.range(2019, Y1 + 1);
    var W = labelW + preW + gapW + yearsPost.length * yearW + padR;
    var xPre = d3.scaleLinear().domain([Y0 - 0.5, 2018.5]).range([labelW, labelW + preW]);
    function X(yr) {
      if (yr <= 2018.5) return xPre(yr);
      return labelW + preW + gapW + (yr - 2018.5) * yearW;
    }

    var y = top;
    L.forEach(function (g) {
      g.y0 = y; y += bandPad + 16;
      g.subs.forEach(function (s) {
        var maxStack = d3.max(Array.from(d3.group(s.items, function (d) { return d.anio; }).values()), function (a) { return a.length; });
        s.rows = maxStack;
        s.y0 = y + lanePad / 2;
        s.h = maxStack * (pillH + pillGap) - pillGap;
        y += s.h + lanePad;
      });
      y += bandPad; g.y1 = y; y += bandGap;
    });
    var H = y + 22;
    svg.attr("viewBox", "0 0 " + W + " " + H).attr("width", "100%").attr("height", null)
      .style("min-width", "1100px").style("display", "block");
    var bg = css("--bg"), muted = css("--muted");
    var g = svg.append("g");

    L.forEach(function (grp) {
      g.append("rect").attr("x", 0).attr("y", grp.y0).attr("width", W).attr("height", grp.y1 - grp.y0)
        .attr("rx", 6).attr("fill", grp.color).attr("fill-opacity", state.scheme === "emergente" ? 0.06 : 0.07);
      g.append("text").attr("class", "thesis-label").attr("x", 14).attr("y", grp.y0 + bandPad + 11).text(grp.name);
      grp.subs.forEach(function (s) {
        g.append("text").attr("class", "lane-label").attr("x", 14).attr("y", s.y0 + pillH / 2 + 4)
          .attr("font-style", "italic").text(s.name);
      });
    });

    d3.range(Y0, Y1 + 1).forEach(function (yr) {
      var show = yr >= 2019 || yr % 2 === 0;
      if (!show) return;
      g.append("text").attr("x", X(yr)).attr("y", top - 18).attr("text-anchor", "middle").attr("font-size", 12)
        .attr("font-weight", yr >= 2019 ? 600 : 400).attr("fill", muted).text(yr);
    });
    var bx = labelW + preW + gapW / 2;
    g.append("line").attr("x1", bx - 5).attr("x2", bx + 5).attr("y1", top - 30).attr("y2", top - 14).attr("stroke", muted);
    g.append("line").attr("x1", bx - 1).attr("x2", bx + 9).attr("y1", top - 30).attr("y2", top - 14).attr("stroke", muted);
    g.append("text").attr("x", (labelW + labelW + preW) / 2).attr("y", top - 36).attr("text-anchor", "middle").attr("font-size", 11)
      .attr("fill", muted).attr("font-style", "italic").text("antecedentes (escala comprimida)");
    g.append("a").attr("class", "printonly").attr("href", "https://x.com/cbellolio/status/2111498263115272614").attr("target", "_blank").attr("rel", "noopener")
      .append("text").attr("x", 14).attr("y", top - 66).attr("font-size", 12).attr("font-weight", 600).attr("fill", css("--text"))
      .attr("text-decoration", "underline").text(state.scheme === "emergente" ? "Colores: tesis de Cristóbal Bellolio (2026) ↗" : "Tipología: Cristóbal Bellolio (2026) ↗");
    g.append("text").attr("class", "printonly").attr("x", 14).attr("y", top - 50).attr("font-size", 11).attr("fill", muted)
      .text(state.scheme === "emergente" ? "Mecanismos causales codificados desde los textos: elaboración propia" : "Asignación de obras: elaboración propia");
    var ox = X(2019);
    g.append("line").attr("x1", ox).attr("x2", ox).attr("y1", top - 8).attr("y2", H - 22)
      .attr("stroke", css("--accent")).attr("stroke-width", 1.5).attr("stroke-dasharray", "2 3");
    g.append("text").attr("x", ox).attr("y", top - 34).attr("text-anchor", "middle").attr("font-size", 11).attr("font-weight", 600).attr("fill", css("--accent")).text("18-O");

    var nodes = [];
    var links = g.append("g");
    L.forEach(function (grp) {
      grp.subs.forEach(function (s) {
        var byYear = Array.from(d3.group(s.items, function (d) { return d.anio; }), function (e) { return { yr: e[0], items: e[1] }; })
          .sort(function (a, b) { return a.yr - b.yr; });
        byYear.forEach(function (gy) {
          gy.items.sort(function (a, b) {
            if (s.code) { var pa = a.mecanismo_principal === s.code ? 0 : 1, pb = b.mecanismo_principal === s.code ? 0 : 1; if (pa !== pb) return pa - pb; }
            return a.etiqueta.localeCompare(b.etiqueta);
          });
          gy.items.forEach(function (d, i) {
            var label = shortName(d), w = Math.min(yearW - 10, textW(label, 12, 500) + 18);
            nodes.push({ d: d, label: label, w: w, cx: X(d.anio), cy: s.y0 + i * (pillH + pillGap) + pillH / 2,
              secondary: !!s.code && d.mecanismo_principal !== s.code, code: s.code });
          });
          gy.cy = s.y0 + ((gy.items.length - 1) * (pillH + pillGap)) / 2 + pillH / 2;
          gy.halfW = d3.max(gy.items, function (d) { return Math.min(yearW - 10, textW(shortName(d), 12, 500) + 18); }) / 2;
        });
        // Corchetes: agrupan las obras de un mismo año para que la línea una años, no obras
        if (!s.code && byYear.length > 1) byYear.forEach(function (gy, k) {
          if (gy.items.length < 2) return;
          var yT = s.y0 + 3, yB = s.y0 + (gy.items.length - 1) * (pillH + pillGap) + pillH - 3;
          [k > 0 ? -1 : 0, k < byYear.length - 1 ? 1 : 0].forEach(function (sd) {
            if (!sd) return;
            var bx = X(gy.yr) + sd * (gy.halfW + 6);
            links.append("path").attr("fill", "none").attr("stroke", s.line).attr("stroke-width", 1.2).attr("opacity", 0.75)
              .attr("d", "M" + (bx - sd * 4) + "," + yT + " L" + bx + "," + yT + " L" + bx + "," + yB + " L" + (bx - sd * 4) + "," + yB);
          });
        });
        for (var i = 0; !s.code && i < byYear.length - 1; i++) {
          var a = byYear[i], b = byYear[i + 1];
          var x1 = X(a.yr) + a.halfW + (a.items.length > 1 ? 6 : 0), x2 = X(b.yr) - b.halfW - (b.items.length > 1 ? 6 : 0), mx = (x1 + x2) / 2;
          var dashed = a.items.concat(b.items).every(function (d) { return d.registro === "opinion"; });
          links.append("path").attr("fill", "none").attr("stroke", s.line).attr("stroke-width", 1.5).attr("opacity", 0.75)
            .attr("stroke-dasharray", dashed ? "4 3" : null)
            .attr("d", "M" + x1 + "," + a.cy + " C" + mx + "," + a.cy + " " + mx + "," + b.cy + " " + x2 + "," + b.cy);
        }
      });
    });

    var ng = svg.append("g");
    var links = ng.selectAll("a.nodelink").data(nodes).enter().append("a").attr("class", "nodelink")
      .attr("href", function (n) { return n.d.fuente_url; }).attr("target", "_blank").attr("rel", "noopener")
      .attr("aria-label", function (n) { return n.d.etiqueta + ". " + n.d.tesis + ", " + n.d.subcorriente + ". Abre la fuente"; });
    var sel = links.append("g").attr("class", "node")
      .attr("transform", function (n) { return "translate(" + n.cx + "," + n.cy + ")"; })
      .classed("sel", function (n) { return state.sel === n.d.id; });
    sel.each(function (n) {
      var el = d3.select(this), c = color(n.d.tesis), op = n.d.registro === "opinion", ens = n.d.registro === "ensayo", ant = n.d.rol === "antecedente";
      if (n.secondary) el.attr("opacity", 0.5);
      el.append("rect").attr("class", "mk").attr("x", -n.w / 2).attr("y", -pillH / 2).attr("width", n.w).attr("height", pillH)
        .attr("rx", ant ? 3 : pillH / 2)
        .attr("fill", op ? bg : c).attr("fill-opacity", op ? 1 : 0.24).attr("stroke", c).attr("stroke-width", 1.5).attr("stroke-dasharray", op ? "4 2.5" : ens ? "1.5 2" : null);
      if (!op) el.insert("rect", ".mk").attr("x", -n.w / 2).attr("y", -pillH / 2).attr("width", n.w).attr("height", pillH).attr("rx", ant ? 3 : pillH / 2).attr("fill", bg);
      el.append("text").attr("text-anchor", "middle").attr("y", 4).attr("font-size", 12).attr("font-weight", 500)
        .attr("font-style", ant ? "italic" : null)
        .attr("fill", css("--text")).text(n.label);
    });
    // Panel de detalle dentro del gráfico, en el espacio libre entre 2023 y 2026
    var sx0 = X(2023) + 80, sx1 = X(2026) - 48;
    var side = document.getElementById("side");
    side.style.left = (sx0 / W * 100) + "%"; side.style.width = ((sx1 - sx0) / W * 100) + "%";
    var det = document.getElementById("detail"); det.classList.remove("on");
    var hideT = null;
    function place(n) {
      var k = svg.node().getBoundingClientRect().height / H;
      var max = H * k - det.offsetHeight - 30, top;
      if (n.cx > sx0 - 70 && n.cx < sx1 + 70) {
        // la obra está bajo el panel: se muestra arriba o abajo de ella
        top = n.cy * k + 18;
        if (top > max) top = n.cy * k - 18 - det.offsetHeight;
      } else {
        top = Math.max(top0 * k, Math.min(n.cy * k - 30, max));
      }
      det.style.top = top + "px";
    }
    var top0 = top;
    links.on("mouseenter", function (evt, n) {
      clearTimeout(hideT); select(n.d, n); det.classList.add("on"); place(n);
    }).on("mouseleave", function () { hideT = setTimeout(function () { det.classList.remove("on"); }, 900); })
      .on("focus", function (evt, n) { select(n.d, n); det.classList.add("on"); place(n); });
    det.onmouseenter = function () { clearTimeout(hideT); };
    det.onmouseleave = function () { hideT = setTimeout(function () { det.classList.remove("on"); }, 400); };

    svg.append("a").attr("class", "printonly").attr("href", "https://belmarfabian.github.io/estallido-tesis/").attr("target", "_blank").attr("rel", "noopener")
      .append("text").attr("x", W - padR).attr("y", H - 10).attr("text-anchor", "end").attr("font-size", 11)
      .attr("fill", css("--faint")).attr("font-style", "italic").text("Tipología: Cristóbal Bellolio (2026). Asignación de obras y diseño: Fabián Belmar · @fabianbelmar_ · belmarfabian.github.io/estallido-tesis");
  }

  function mecNames(d) {
    return d.mecs.map(function (c) { return CODE[c] ? CODE[c].mecanismo + (c === d.mecanismo_principal ? " (principal)" : "") : c; }).join("; ");
  }

  function select(d, n) {
    state.sel = d.id;
    d3.selectAll("#map g.node").classed("sel", function (n) { return n.d.id === d.id; });
    var reg = { investigacion: "Investigación", ensayo: "Ensayo", opinion: "Opinión o declaración" }[d.registro];
    var rol = d.rol === "antecedente" ? " · Antecedente previo al 18-O" : "";
    var here = n && n.code ? "<div>Esta fila: " + esc(CODE[n.code].mecanismo) + (n.secondary ? " (mecanismo secundario)" : " (mecanismo principal)") + "</div>" : "";
    document.getElementById("detail").innerHTML =
      '<div class="ref">' + esc(d.referencia) + "</div>" +
      '<div class="meta"><div><span style="color:' + color(d.tesis) + '">●</span> Tesis ' + esc(d.tesis.toLowerCase()) + " · " + esc(d.subcorriente) + "</div>" + here +
      "<div>Mecanismos: " + esc(mecNames(d)) + "</div><div>" + reg + rol + "</div>" +
      (d.nota ? "<div>" + esc(d.nota) + "</div>" : "") +
      '<div><a href="' + esc(d.fuente_url) + '" target="_blank" rel="noopener">Ver fuente ↗</a></div></div>';
  }

  function smallChart(id, W, H) {
    var svg = d3.select(id); svg.selectAll("*").remove();
    svg.attr("viewBox", "0 0 " + W + " " + H).attr("width", "100%");
    return svg;
  }

  function renderBars() {
    var host = document.getElementById("bars").parentNode;
    var W = Math.max(320, host.clientWidth - 20), H = 260, m = { l: 28, r: 8, t: 10, b: 24 };
    var svg = smallChart("#bars", W, H);
    var v = DATA.filter(visible);
    var years = d3.range(d3.min(v, function (d) { return d.anio; }) || 2019, Y1 + 1);
    var keys = THESES.map(function (t) { return t.key; }).filter(function (k) { return state.on[k]; });
    var REG = ["investigacion", "ensayo", "opinion"], REGN = { investigacion: "investigación", ensayo: "ensayo", opinion: "opinión" };
    var x = d3.scaleBand().domain(years).range([m.l, W - m.r]).padding(0.28);
    var ymax = d3.max(years, function (yr) { return v.filter(function (d) { return d.anio === yr; }).length; }) || 1;
    var y = d3.scaleLinear().domain([0, ymax]).nice().range([H - m.b, m.t]);
    y.ticks(4).forEach(function (t) {
      svg.append("line").attr("class", "gridline").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(t)).attr("y2", y(t));
      svg.append("text").attr("x", m.l - 6).attr("y", y(t) + 4).attr("text-anchor", "end").attr("font-size", 11).attr("fill", css("--muted")).text(t);
    });
    years.forEach(function (yr) {
      if (W > 640 || years.length < 10 || yr % 2 === 0) svg.append("text").attr("x", x(yr) + x.bandwidth() / 2).attr("y", H - 6).attr("text-anchor", "middle").attr("font-size", 11).attr("fill", css("--muted")).text(yr);
    });
    var bg = css("--bg"), tip2 = document.getElementById("tip2");
    years.forEach(function (yr) {
      var acc = 0;
      keys.forEach(function (k) {
        REG.forEach(function (r) {
          var its = v.filter(function (d) { return d.anio === yr && d.tesis === k && d.registro === r; });
          if (!its.length) return;
          var y1 = y(acc + its.length), h = y(acc) - y1; acc += its.length;
          var c = color(k);
          svg.append("rect").attr("x", x(yr) + 0.75).attr("width", x.bandwidth() - 1.5)
            .attr("y", y1 + 0.75).attr("height", Math.max(0, h - 2.5)).attr("rx", 2)
            .attr("fill", r === "opinion" ? bg : c).attr("fill-opacity", r === "ensayo" ? 0.4 : 1)
            .attr("stroke", c).attr("stroke-width", 1.5).attr("stroke-dasharray", r === "opinion" ? "4 2.5" : null)
            .on("mousemove", function (evt) {
              showTip(tip2, '<div class="t1">' + yr + " · " + esc(k) + " · " + REGN[r] + " (" + its.length + ')</div><div class="t2">' +
                its.map(function (d) { return esc(d.etiqueta); }).join("<br>") + "</div>", evt, host);
            }).on("mouseleave", function () { hideTip(tip2); });
        });
      });
    });
    var ink = css("--text-2");
    document.getElementById("legend2").innerHTML =
      '<span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="2" fill="' + ink + '" stroke="' + ink + '" stroke-width="1.5"/></svg>Investigación</span>' +
      '<span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="2" fill="' + ink + '" fill-opacity=".4" stroke="' + ink + '" stroke-width="1.5"/></svg>Ensayo</span>' +
      '<span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="2" fill="' + bg + '" stroke="' + ink + '" stroke-dasharray="4 2.5" stroke-width="1.5"/></svg>Opinión o declaración</span>';
  }

  function renderTable() {
    var tb = document.querySelector("#tbl tbody");
    var rows = DATA.filter(visible).filter(function (d) {
      if (!state.q) return true;
      return (d.referencia + " " + d.tesis + " " + d.subcorriente + " " + mecNames(d) + " " + d.autores).toLowerCase().indexOf(state.q) >= 0;
    }).sort(function (a, b) { return a.anio - b.anio || a.tesis.localeCompare(b.tesis) || a.etiqueta.localeCompare(b.etiqueta); });
    tb.innerHTML = rows.map(function (d) {
      return "<tr><td>" + d.anio + '</td><td><span class="dot" style="background:' + color(d.tesis) + '"></span>' + esc(d.tesis) +
        "</td><td>" + esc(d.subcorriente) + (d.registro !== "investigacion" ? ' <span style="color:var(--faint)">(' + (d.registro === "opinion" ? "opinión" : d.registro) + ')</span>' : "") +
        "</td><td>" + esc(mecNames(d)) +
        '</td><td class="ref">' + esc(d.referencia) + (d.nota ? '<div style="font-family:Inter,sans-serif;font-size:12px;color:var(--muted)">' + esc(d.nota) + "</div>" : "") +
        '</td><td><a href="' + esc(d.fuente_url) + '" target="_blank" rel="noopener">↗</a></td></tr>';
    }).join("") || '<tr><td colspan="6" style="color:var(--muted)">Sin resultados.</td></tr>';
  }
})();
