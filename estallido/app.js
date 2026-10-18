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
  var state = { on: {}, reg: "todos", ant: true, sel: null, q: "" };
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
  propose.href = "https://github.com/belmarfabian/belmarfabian.github.io/issues/new?title=" +
    encodeURIComponent("Estallido: nueva referencia") + "&body=" +
    encodeURIComponent("Autor(es):\nAño:\nTítulo:\nEditorial o revista:\nTesis que defiende (transformacional / populista / estructural / insurreccional / otra):\nEnlace a la fuente:\n");

  var DATA = [];
  fetch("datos/tesis_estallido.json").then(function (r) { return r.json(); }).then(function (d) {
    DATA = d.map(function (x) { x.anio = +x.anio; return x; });
    buildChips(); bind(); renderAll();
  }).catch(function () {
    document.getElementById("detail").textContent = "No se pudieron cargar los datos. Descarga el CSV desde el enlace de la tabla.";
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
    document.getElementById("reg").addEventListener("change", function (e) { state.reg = e.target.value; renderAll(); });
    document.getElementById("ant").addEventListener("change", function (e) { state.ant = e.target.checked; renderAll(); });
    document.getElementById("q").addEventListener("input", function (e) { state.q = e.target.value.toLowerCase(); renderTable(); });
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(renderAll, 150); });
  }

  function renderAll() {
    buildChipsColors(); renderStats(); renderMap(); renderBars(); renderCum(); renderTable(); renderLegend();
  }
  function buildChipsColors() {
    document.querySelectorAll("#chips .chip i").forEach(function (el, i) { el.style.background = color(THESES[i].key); });
  }

  function renderStats() {
    var v = DATA.filter(visible);
    var subs = new Set(v.map(function (d) { return d.tesis + "|" + d.subcorriente; }));
    var acad = v.filter(function (d) { return d.registro === "academico"; }).length;
    var authors = new Set(v.map(function (d) { return d.autores; }));
    var html = [
      [v.length, "obras"], [authors.size, "autores o fuentes"], [subs.size, "subcorrientes"],
      [acad, "académicas o ensayo"], [v.length - acad, "opinión o declaración"]
    ].map(function (s) { return '<div class="stat"><b>' + s[0] + "</b><span>" + s[1] + "</span></div>"; }).join("");
    document.getElementById("stats").innerHTML = html;
  }

  function renderLegend() {
    var ink = css("--text-2"), bg = css("--bg");
    document.getElementById("legend").innerHTML =
      '<span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="6" fill="' + ink + '" fill-opacity=".24" stroke="' + ink + '" stroke-width="1.5"/></svg>Literatura académica y ensayo</span>' +
      '<span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="6" fill="' + bg + '" stroke="' + ink + '" stroke-dasharray="4 2.5" stroke-width="1.5"/></svg>Discurso político u opinión</span>' +
      '<span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="2" fill="' + ink + '" fill-opacity=".24" stroke="' + ink + '" stroke-width="1.5"/></svg>Antecedente previo al 18-O</span>' +
      '<span><svg width="30" height="14"><line x1="1" y1="7" x2="29" y2="7" stroke="' + ink + '" stroke-width="1.5"/></svg>Continuidad dentro de una subcorriente</span>';
  }

  function lanes() {
    var out = [];
    THESES.forEach(function (t) {
      var items = DATA.filter(function (d) { return d.tesis === t.key && visible(d); });
      if (!items.length) return;
      var subs = [];
      items.forEach(function (d) { if (subs.indexOf(d.subcorriente) < 0) subs.push(d.subcorriente); });
      subs.sort(function (a, b) {
        var fa = d3.min(items.filter(function (d) { return d.subcorriente === a; }), function (d) { return d.anio; });
        var fb = d3.min(items.filter(function (d) { return d.subcorriente === b; }), function (d) { return d.anio; });
        return fa - fb || a.localeCompare(b);
      });
      out.push({ thesis: t.key, subs: subs.map(function (s) {
        var its = items.filter(function (d) { return d.subcorriente === s; });
        return { name: s, items: its, first: d3.min(its, function (d) { return d.anio; }),
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
    var labelW = 190, preW = 200, gapW = 34, yearW = 145, padR = 20, top = 52, pillH = 22, pillGap = 5, lanePad = 9, bandPad = 10, bandGap = 8;
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
      var c = color(grp.thesis);
      g.append("rect").attr("x", 0).attr("y", grp.y0).attr("width", W).attr("height", grp.y1 - grp.y0)
        .attr("rx", 10).attr("fill", c).attr("fill-opacity", 0.07);
      g.append("rect").attr("x", 0).attr("y", grp.y0).attr("width", 4).attr("height", grp.y1 - grp.y0).attr("fill", c);
      g.append("text").attr("class", "thesis-label").attr("x", 14).attr("y", grp.y0 + bandPad + 11).text(grp.thesis);
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
          gy.items.sort(function (a, b) { return a.etiqueta.localeCompare(b.etiqueta); });
          gy.items.forEach(function (d, i) {
            var label = shortName(d), w = Math.min(yearW - 10, textW(label, 12, 500) + 18);
            nodes.push({ d: d, label: label, w: w, cx: X(d.anio), cy: s.y0 + i * (pillH + pillGap) + pillH / 2 });
          });
          gy.cy = s.y0 + ((gy.items.length - 1) * (pillH + pillGap)) / 2 + pillH / 2;
          gy.halfW = d3.max(gy.items, function (d) { return Math.min(yearW - 10, textW(shortName(d), 12, 500) + 18); }) / 2;
        });
        for (var i = 0; i < byYear.length - 1; i++) {
          var a = byYear[i], b = byYear[i + 1];
          var x1 = X(a.yr) + a.halfW, x2 = X(b.yr) - b.halfW, mx = (x1 + x2) / 2;
          var dashed = a.items.concat(b.items).every(function (d) { return d.registro === "opinion"; });
          links.append("path").attr("fill", "none").attr("stroke", color(grp.thesis)).attr("stroke-width", 1.5).attr("opacity", 0.75)
            .attr("stroke-dasharray", dashed ? "4 3" : null)
            .attr("d", "M" + x1 + "," + a.cy + " C" + mx + "," + a.cy + " " + mx + "," + b.cy + " " + x2 + "," + b.cy);
        }
      });
    });

    var ng = svg.append("g");
    var sel = ng.selectAll("g.node").data(nodes).enter().append("g").attr("class", "node")
      .attr("tabindex", 0).attr("role", "button")
      .attr("aria-label", function (n) { return n.d.etiqueta + ". " + n.d.tesis + ", " + n.d.subcorriente; })
      .attr("transform", function (n) { return "translate(" + n.cx + "," + n.cy + ")"; })
      .classed("sel", function (n) { return state.sel === n.d.id; });
    sel.each(function (n) {
      var el = d3.select(this), c = color(n.d.tesis), op = n.d.registro === "opinion", ant = n.d.rol === "antecedente";
      el.append("rect").attr("class", "mk").attr("x", -n.w / 2).attr("y", -pillH / 2).attr("width", n.w).attr("height", pillH)
        .attr("rx", ant ? 3 : pillH / 2)
        .attr("fill", op ? bg : c).attr("fill-opacity", op ? 1 : 0.24).attr("stroke", c).attr("stroke-width", 1.5).attr("stroke-dasharray", op ? "4 2.5" : null);
      if (!op) el.insert("rect", ".mk").attr("x", -n.w / 2).attr("y", -pillH / 2).attr("width", n.w).attr("height", pillH).attr("rx", ant ? 3 : pillH / 2).attr("fill", bg);
      el.append("text").attr("text-anchor", "middle").attr("y", 4).attr("font-size", 12).attr("font-weight", 500)
        .attr("font-style", ant ? "italic" : null)
        .attr("fill", css("--text")).text(n.label);
    });
    var hostFig = svg.node().closest(".fig");
    sel.on("mouseenter", function (evt, n) {
      showTip(tip, '<div class="t1">' + esc(n.d.etiqueta) + '</div><div class="t2">' + esc(n.d.tesis) + " · " + esc(n.d.subcorriente) + "</div>", evt, hostFig);
    }).on("mousemove", function (evt) { showTip(tip, tip.innerHTML, evt, hostFig); })
      .on("mouseleave", function () { hideTip(tip); })
      .on("click", function (evt, n) { select(n.d); })
      .on("keydown", function (evt, n) { if (evt.key === "Enter" || evt.key === " ") { evt.preventDefault(); select(n.d); } });

    svg.append("text").attr("x", W - padR).attr("y", H - 10).attr("text-anchor", "end").attr("font-size", 11)
      .attr("fill", css("--faint")).attr("font-style", "italic").text("Fabián Belmar · @fabianbelmar_ · belmarfabian.github.io/estallido");
  }

  function select(d) {
    state.sel = d.id;
    d3.selectAll("#map g.node").classed("sel", function (n) { return n.d.id === d.id; });
    var reg = d.registro === "academico" ? "Literatura académica o ensayo" : "Discurso político u opinión";
    var rol = d.rol === "antecedente" ? " · Antecedente previo al 18-O" : "";
    document.getElementById("detail").innerHTML =
      '<div class="ref">' + esc(d.referencia) + "</div>" +
      '<div class="meta"><span style="color:' + color(d.tesis) + '">●</span> ' + esc(d.tesis) + " · " + esc(d.subcorriente) + " · " + reg + rol +
      (d.nota ? "<br>" + esc(d.nota) : "") +
      ' · <a href="' + esc(d.fuente_url) + '" target="_blank" rel="noopener">Ver fuente ↗</a></div>';
  }

  function smallChart(id, W, H) {
    var svg = d3.select(id); svg.selectAll("*").remove();
    svg.attr("viewBox", "0 0 " + W + " " + H).attr("width", "100%");
    return svg;
  }

  function renderBars() {
    var host = document.getElementById("bars").parentNode;
    var W = Math.max(300, host.clientWidth - 20), H = 220, m = { l: 28, r: 8, t: 10, b: 24 };
    var svg = smallChart("#bars", W, H);
    var v = DATA.filter(visible);
    var years = d3.range(d3.min(v, function (d) { return d.anio; }) || 2019, Y1 + 1);
    var keys = THESES.map(function (t) { return t.key; }).filter(function (k) { return state.on[k]; });
    var rows = years.map(function (yr) {
      var o = { year: yr };
      keys.forEach(function (k) { o[k] = v.filter(function (d) { return d.anio === yr && d.tesis === k; }).length; });
      return o;
    });
    var stack = d3.stack().keys(keys)(rows);
    var x = d3.scaleBand().domain(years).range([m.l, W - m.r]).padding(0.28);
    var ymax = d3.max(rows, function (r) { return d3.sum(keys, function (k) { return r[k]; }); }) || 1;
    var y = d3.scaleLinear().domain([0, ymax]).nice().range([H - m.b, m.t]);
    y.ticks(4).forEach(function (t) {
      svg.append("line").attr("class", "gridline").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(t)).attr("y2", y(t));
      svg.append("text").attr("x", m.l - 6).attr("y", y(t) + 4).attr("text-anchor", "end").attr("font-size", 11).attr("fill", css("--muted")).text(t);
    });
    years.forEach(function (yr) {
      if (years.length < 10 || yr % 2 === 0) svg.append("text").attr("x", x(yr) + x.bandwidth() / 2).attr("y", H - 6).attr("text-anchor", "middle").attr("font-size", 11).attr("fill", css("--muted")).text(yr);
    });
    var bg = css("--bg"), tip2 = document.getElementById("tip2"), hostFig = host;
    stack.forEach(function (layer) {
      layer.forEach(function (seg) {
        var h = y(seg[0]) - y(seg[1]); if (h <= 0) return;
        svg.append("rect").attr("x", x(seg.data.year)).attr("width", x.bandwidth())
          .attr("y", y(seg[1])).attr("height", Math.max(0, h - 2)).attr("rx", 2)
          .attr("fill", color(layer.key)).attr("stroke", bg).attr("stroke-width", 0)
          .on("mousemove", function (evt) {
            var names = v.filter(function (d) { return d.anio === seg.data.year && d.tesis === layer.key; }).map(function (d) { return esc(d.etiqueta); }).join("<br>");
            showTip(tip2, '<div class="t1">' + seg.data.year + " · " + esc(layer.key) + " (" + (seg[1] - seg[0]) + ')</div><div class="t2">' + names + "</div>", evt, hostFig);
          }).on("mouseleave", function () { hideTip(tip2); });
      });
    });
  }

  function renderCum() {
    var host = document.getElementById("cum").parentNode;
    var W = Math.max(300, host.clientWidth - 20), H = 220, m = { l: 28, r: 12, t: 10, b: 24 };
    var svg = smallChart("#cum", W, H);
    var v = DATA.filter(visible);
    var start = d3.min(v, function (d) { return d.anio; }) || 2019;
    var years = d3.range(start, Y1 + 1);
    var seen = new Set(), seenTh = new Set();
    var pts = years.map(function (yr) {
      var newOnes = [];
      v.filter(function (d) { return d.anio === yr; }).forEach(function (d) {
        var k = d.tesis + "|" + d.subcorriente; if (!seen.has(k)) { seen.add(k); newOnes.push(d.subcorriente + " (" + d.tesis + ")"); }
        seenTh.add(d.tesis);
      });
      return { year: yr, n: seen.size, th: seenTh.size, nuevos: newOnes };
    });
    var x = d3.scaleLinear().domain([start, Y1]).range([m.l + 6, W - m.r]);
    var y = d3.scaleLinear().domain([0, d3.max(pts, function (p) { return p.n; }) || 1]).nice().range([H - m.b, m.t]);
    y.ticks(4).forEach(function (t) {
      svg.append("line").attr("class", "gridline").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(t)).attr("y2", y(t));
      svg.append("text").attr("x", m.l - 6).attr("y", y(t) + 4).attr("text-anchor", "end").attr("font-size", 11).attr("fill", css("--muted")).text(t);
    });
    years.forEach(function (yr) {
      if (years.length < 10 || yr % 2 === 0) svg.append("text").attr("x", x(yr)).attr("y", H - 6).attr("text-anchor", "middle").attr("font-size", 11).attr("fill", css("--muted")).text(yr);
    });
    var line = d3.line().curve(d3.curveStepAfter).x(function (p) { return x(p.year); }).y(function (p) { return y(p.n); });
    svg.append("path").datum(pts).attr("fill", "none").attr("stroke", css("--accent")).attr("stroke-width", 2).attr("d", line);
    var tip3 = document.getElementById("tip3"), bg = css("--bg");
    pts.forEach(function (p) {
      if (!p.nuevos.length) return;
      svg.append("circle").attr("cx", x(p.year)).attr("cy", y(p.n)).attr("r", 4.5).attr("fill", css("--accent")).attr("stroke", bg).attr("stroke-width", 2);
    });
    pts.forEach(function (p) {
      svg.append("rect").attr("x", x(p.year) - 10).attr("y", m.t).attr("width", 20).attr("height", H - m.t - m.b).attr("fill", "transparent")
        .on("mousemove", function (evt) {
          showTip(tip3, '<div class="t1">' + p.year + ": " + p.n + " subcorrientes</div>" + (p.nuevos.length ? '<div class="t2">Nuevas: ' + p.nuevos.map(esc).join("; ") + "</div>" : '<div class="t2">Sin ramas nuevas</div>'), evt, host);
        }).on("mouseleave", function () { hideTip(tip3); });
    });
    var last = pts[pts.length - 1];
    svg.append("text").attr("x", x(last.year) - 4).attr("y", y(last.n) + 16).attr("text-anchor", "end").attr("font-size", 11).attr("fill", css("--text-2")).text(last.n + " subcorrientes");
  }

  function renderTable() {
    var tb = document.querySelector("#tbl tbody");
    var rows = DATA.filter(visible).filter(function (d) {
      if (!state.q) return true;
      return (d.referencia + " " + d.tesis + " " + d.subcorriente + " " + d.autores).toLowerCase().indexOf(state.q) >= 0;
    }).sort(function (a, b) { return a.anio - b.anio || a.tesis.localeCompare(b.tesis) || a.etiqueta.localeCompare(b.etiqueta); });
    tb.innerHTML = rows.map(function (d) {
      return "<tr><td>" + d.anio + '</td><td><span class="dot" style="background:' + color(d.tesis) + '"></span>' + esc(d.tesis) +
        "</td><td>" + esc(d.subcorriente) + (d.registro === "opinion" ? ' <span style="color:var(--faint)">(opinión)</span>' : "") +
        '</td><td class="ref">' + esc(d.referencia) + (d.nota ? '<div style="font-family:Inter,sans-serif;font-size:12px;color:var(--muted)">' + esc(d.nota) + "</div>" : "") +
        '</td><td><a href="' + esc(d.fuente_url) + '" target="_blank" rel="noopener">↗</a></td></tr>';
    }).join("") || '<tr><td colspan="5" style="color:var(--muted)">Sin resultados.</td></tr>';
  }
})();
