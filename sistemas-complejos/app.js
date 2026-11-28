(function () {
  "use strict";

  /* Módulos de la segunda parte («La teoría detrás»). */
  var MODULOS = [
    { key: "intro", n: 1, t: "Qué es un sistema complejo",
      d: "El término complejidad se usa de muchas maneras y no siempre con precisión, por lo que conviene partir por una definición clara antes de revisar cualquier modelo. Los textos de este módulo ofrecen un mapa general del campo y de sus conceptos básicos (e.g., interacción local, retroalimentación, ausencia de un control central y orden que nadie diseñó)." },
    { key: "emergencia", n: 2, t: "De lo individual a lo colectivo",
      d: "El punto de partida de los estudios de complejidad en lo social es que el resultado colectivo no es la suma de las intenciones individuales. Un barrio, por ejemplo, puede segregarse aunque ninguno de sus vecinos quiera vivir segregado, y una canción puede volverse un éxito más por azar que por su calidad (Schelling 1971; Salganik et al. 2006)." },
    { key: "umbrales", n: 3, t: "Umbrales, contagios y puntos de quiebre",
      d: "Muchos fenómenos sociales no cambian de forma gradual sino de golpe, como una protesta que crece en pocas horas o una norma que pierde vigencia de un año a otro. Los textos de este módulo explican por qué ocurre esto y si es posible anticiparlo, una pregunta que tiene bastante sentido para pensar el Chile de la última década." },
    { key: "redes", n: 4, t: "Redes",
      d: "La forma en que estamos conectados importa tanto como lo que pensamos, pues de ella depende qué información nos llega y qué comportamientos se propagan. Este módulo reúne los textos que fundaron el análisis moderno de redes y un manual abierto para quien nunca ha trabajado con un grafo." },
    { key: "cooperacion", n: 5, t: "Cooperación y gobierno de lo común",
      d: "Si nadie coordina, ¿cómo se explica que las personas cooperen y sostengan reglas en el tiempo? Este módulo reúne dos respuestas. La primera viene de la teoría de juegos evolutiva (Axelrod 1984), mientras que la segunda viene del trabajo empírico sobre comunidades que administran recursos comunes sin depender del mercado ni del Estado (Ostrom 1990)." },
    { key: "luhmann", n: 6, t: "Complejidad y teoría de sistemas sociales",
      d: "La teoría de sistemas sociales de Niklas Luhmann también parte del problema de la complejidad, si bien lo aborda desde la comunicación y no desde los individuos. En este módulo propongo una entrada gradual a esta teoría, con autores chilenos y latinoamericanos que la han utilizado para pensar problemas de la región (Rodríguez y Arnold 1991; Mascareño 2010)." },
    { key: "practica", n: 7, t: "Herramientas para practicar",
      d: "Este módulo reúne cursos, programas y manuales para pasar de leer modelos a construirlos. Para comenzar recomiendo NetLogo, pues no exige saber programar, mientras que Mesa es una buena alternativa para quienes ya trabajan en Python." }
  ];

  /* nivel: 1 entrada, 2 intermedio, 3 avanzado. Cada referencia se verificó en una fuente publicada. */
  var R = [
    { m: "intro", tipo: "Artículo", nivel: 1, lang: "en", acceso: "abierto",
      ref: "Weaver, W. (1948). Science and complexity. <i>American Scientist</i>, 36(4), 536–544.",
      url: "https://repositorio.colmex.mx/pdf_viewer/7m01bq982?locale=es",
      nota: "Es el ensayo fundador del campo y se lee en una tarde. Weaver distingue entre problemas de simplicidad, de complejidad desorganizada y de complejidad organizada, y sostiene que estos últimos, que son los que importan para lo social, quedaban fuera de las herramientas de su época." },
    { m: "intro", tipo: "Libro", nivel: 1, lang: "en", acceso: "biblioteca",
      ref: "Mitchell, M. (2009). <i>Complexity: A guided tour</i>. Oxford University Press.",
      url: "https://search.worldcat.org/title/Complexity-:-a-guided-tour/oclc/216938473",
      nota: "Es el libro de divulgación que acompaña al curso de Complexity Explorer. Explica de dónde vienen las ideas del campo y por qué todavía no existe una sola definición de complejidad." },
    { m: "intro", tipo: "Artículo", nivel: 2, lang: "en", acceso: "abierto",
      ref: "Ladyman, J., Lambert, J., & Wiesner, K. (2013). What is a complex system? <i>European Journal for Philosophy of Science</i>, 3(1), 33–67.",
      url: "https://doi.org/10.1007/s13194-012-0056-8", alt: "https://philsci-archive.pitt.edu/9044/", altt: "Preprint",
      nota: "Revisa las definiciones de sistema complejo que circulan entre disciplinas y muestra que varias son vagas o insuficientes. Lo recomiendo para no usar el término como sinónimo de «complicado», una confusión bastante frecuente en ciencias sociales." },
    { m: "intro", tipo: "Libro", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Miller, J. H., & Page, S. E. (2007). <i>Complex adaptive systems: An introduction to computational models of social life</i>. Princeton University Press.",
      url: "https://press.princeton.edu/node/22407",
      nota: "Está pensado para cientistas sociales y explica por qué modelar con agentes que se adaptan cambia las preguntas que podemos hacer sobre mercados, elecciones u organizaciones." },
    { m: "intro", tipo: "Libro", nivel: 3, lang: "en", acceso: "biblioteca",
      ref: "Byrne, D., & Callaghan, G. (2022). <i>Complexity theory and the social sciences: The state of the art</i> (2.ª ed.). Routledge.",
      url: "https://www.routledge.com/Complexity-Theory-and-the-Social-Sciences-The-State-of-the-Art/Byrne-Callaghan/p/book/9781032100869",
      nota: "Ofrece un panorama de cómo la complejidad se ha incorporado a la teoría social y a los métodos cualitativos, cuantitativos y mixtos. Lo recomiendo para quien ya pasó por los módulos 2 a 5 y quiere discutir sus límites." },

    { m: "emergencia", tipo: "Artículo", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Schelling, T. C. (1971). Dynamic models of segregation. <i>Journal of Mathematical Sociology</i>, 1(2), 143–186.",
      url: "https://doi.org/10.1080/0022250X.1971.9989794",
      nota: "Es el artículo original detrás de Parable of the Polygons. Schelling hizo sus primeras simulaciones con monedas sobre un tablero, por lo que vale la pena replicarlas en sala antes de abrir un computador." },
    { m: "emergencia", tipo: "Artículo", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Salganik, M. J., Dodds, P. S., & Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. <i>Science</i>, 311(5762), 854–856.",
      url: "https://doi.org/10.1126/science.1121066",
      nota: "Es un experimento con más de 14.000 personas en un mercado de canciones creado para la ocasión. Cuando los participantes podían ver lo que descargaban los demás, el éxito se volvió más desigual y menos predecible, lo que lo hace bastante discutible en clase." },
    { m: "emergencia", tipo: "Artículo", nivel: 3, lang: "en", acceso: "biblioteca",
      ref: "Epstein, J. M. (1999). Agent-based computational models and generative social science. <i>Complexity</i>, 4(5), 41–60.",
      url: "https://doi.org/10.1002/(SICI)1099-0526(199905/06)4:5<41::AID-CPLX9>3.0.CO;2-F",
      nota: "Defiende una idea exigente de explicación, pues sostiene que para explicar un patrón social hay que poder generarlo a partir de la interacción entre agentes. Es un buen texto para discutir qué cuenta como explicación en ciencias sociales." },
    { m: "emergencia", tipo: "Libro", nivel: 3, lang: "en", acceso: "biblioteca",
      ref: "Epstein, J. M., & Axtell, R. (1996). <i>Growing artificial societies: Social science from the bottom up</i>. Brookings Institution Press; MIT Press.",
      url: "https://www.brookings.edu/books/growing-artificial-societies/",
      nota: "Es el clásico Sugarscape, una sociedad artificial en la que aparecen desigualdad, comercio y migración a partir de reglas muy simples. Recomiendo hojear los experimentos más que leerlo completo." },

    { m: "umbrales", tipo: "Artículo", nivel: 1, lang: "en", acceso: "biblioteca",
      ref: "Granovetter, M. (1978). Threshold models of collective behavior. <i>American Journal of Sociology</i>, 83(6), 1420–1443.",
      url: "https://doi.org/10.1086/226707",
      nota: "Cada persona se suma a una acción colectiva si ya se sumaron suficientes otros, de modo que dos grupos casi idénticos pueden terminar en resultados opuestos. Se lee sin matemáticas y es la base de la entrada sobre la ola del estadio." },
    { m: "umbrales", tipo: "Artículo", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Centola, D., & Macy, M. (2007). Complex contagions and the weakness of long ties. <i>American Journal of Sociology</i>, 113(3), 702–734.",
      url: "https://doi.org/10.1086/521848",
      nota: "Distingue entre lo que se contagia con un solo contacto (e.g., un rumor) y lo que requiere el refuerzo de varios (e.g., sumarse a un movimiento riesgoso). Para esto último, los lazos lejanos ayudan menos de lo que se suele creer." },
    { m: "umbrales", tipo: "Libro", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Centola, D. (2018). <i>How behavior spreads: The science of complex contagions</i>. Princeton University Press.",
      url: "https://press.princeton.edu/node/6951",
      nota: "Es la versión extensa del artículo anterior, con experimentos en línea y aplicaciones a salud pública, tecnología y movimientos sociales. El capítulo introductorio basta para una sesión." },
    { m: "umbrales", tipo: "Artículo", nivel: 3, lang: "en", acceso: "biblioteca",
      ref: "Scheffer, M., Bascompte, J., Brock, W. A., Brovkin, V., Carpenter, S. R., Dakos, V., Held, H., van Nes, E. H., Rietkerk, M., & Sugihara, G. (2009). Early-warning signals for critical transitions. <i>Nature</i>, 461(7260), 53–59.",
      url: "https://doi.org/10.1038/nature08227",
      nota: "Viene de la ecología, pero su pregunta es bastante social, pues indaga si existen señales estadísticas antes de un quiebre (e.g., más varianza o una recuperación más lenta). Abre la discusión sobre si las crisis sociales pueden anticiparse y con qué datos." },

    { m: "redes", tipo: "Artículo", nivel: 1, lang: "en", acceso: "biblioteca",
      ref: "Granovetter, M. S. (1973). The strength of weak ties. <i>American Journal of Sociology</i>, 78(6), 1360–1380.",
      url: "https://doi.org/10.1086/225469",
      nota: "Muestra que los conocidos, más que los amigos cercanos, son quienes traen información nueva, por ejemplo sobre un trabajo. Es uno de los artículos más citados de la sociología y un buen ejemplo de cómo una idea simple ordena mucha evidencia." },
    { m: "redes", tipo: "Artículo", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Watts, D. J., & Strogatz, S. H. (1998). Collective dynamics of «small-world» networks. <i>Nature</i>, 393(6684), 440–442.",
      url: "https://doi.org/10.1038/30918",
      nota: "Muestra que bastan unos pocos atajos en una red muy local para que cualquier par de nodos quede a pocos pasos. Es la explicación formal de los seis grados de separación y de la entrada sobre Kevin Bacon." },
    { m: "redes", tipo: "Libro", nivel: 2, lang: "en", acceso: "abierto",
      ref: "Barabási, A.-L. (2016). <i>Network science</i>. Cambridge University Press.",
      url: "https://networksciencebook.com/",
      nota: "Es un manual completo con versión en línea gratuita, visualizaciones interactivas y diapositivas que el autor permite usar en clases. Los primeros cuatro capítulos son accesibles para pregrado." },
    { m: "redes", tipo: "Artículo", nivel: 3, lang: "en", acceso: "biblioteca",
      ref: "Barabási, A.-L., & Albert, R. (1999). Emergence of scaling in random networks. <i>Science</i>, 286(5439), 509–512.",
      url: "https://doi.org/10.1126/science.286.5439.509",
      nota: "Propone que las redes crecen por apego preferencial, es decir, que quien ya tiene muchas conexiones recibe más. Esto explicaría por qué en muchas redes unos pocos nodos concentran casi todos los vínculos." },

    { m: "cooperacion", tipo: "Libro", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Axelrod, R. (1984). <i>The evolution of cooperation</i>. Basic Books.",
      url: "https://www.basicbooks.com/titles/robert-axelrod/the-evolution-of-cooperation/9780465005642/",
      nota: "Relata el torneo de estrategias en que ganó «toma y daca», es decir, cooperar primero y luego imitar lo que hizo el otro. Es un clásico para discutir cómo surge la cooperación entre egoístas sin una autoridad que la imponga." },
    { m: "cooperacion", tipo: "Libro", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Ostrom, E. (1990). <i>Governing the commons: The evolution of institutions for collective action</i>. Cambridge University Press.",
      url: "https://www.cambridge.org/core/books/governing-the-commons/A8BB63BC4A1433A50A3FB92EDBBB97D5",
      nota: "A partir de casos de pescadores, regantes y pastores que administran recursos comunes sin mercado ni Estado, Ostrom discute la idea de la tragedia de los comunes y propone principios de diseño que siguen presentes en la discusión." },
    { m: "cooperacion", tipo: "Artículo", nivel: 2, lang: "en", acceso: "abierto",
      ref: "Ostrom, E. (2010). Beyond markets and states: Polycentric governance of complex economic systems. <i>American Economic Review</i>, 100(3), 641–672.",
      url: "https://doi.org/10.1257/aer.100.3.641", alt: "https://dlc.dlib.indiana.edu/dlc/bitstream/handle/10535/7707/ostrom.pdf", altt: "Borrador abierto",
      nota: "Es su conferencia del Nobel, donde resume medio siglo de investigación y explica por qué los sistemas con muchos centros de decisión suelen funcionar mejor que una reforma única impuesta desde arriba, una idea que conversa bien con Waissbluth." },

    { m: "luhmann", tipo: "Libro", nivel: 1, lang: "es", acceso: "biblioteca",
      ref: "Rodríguez, D., & Arnold, M. (1991). <i>Sociedad y teoría de sistemas: elementos para la comprensión de la teoría de Niklas Luhmann</i>. Editorial Universitaria.",
      url: "https://repositorio.uchile.cl/handle/2250/122275",
      nota: "Escrito por dos profesores chilenos y con varias ediciones, sigue siendo una de las mejores entradas en español, pues parte por la teoría general de sistemas y llega a Luhmann de forma gradual." },
    { m: "luhmann", tipo: "Libro", nivel: 1, lang: "es", acceso: "biblioteca",
      ref: "Corsi, G., Esposito, E., & Baraldi, C. (1996). <i>GLU: Glosario sobre la teoría social de Niklas Luhmann</i> (J. Torres Nafarrate, Trad.). Universidad Iberoamericana; ITESO; Anthropos.",
      url: "https://opac.biblio.iteso.mx/vufind/Record/000049455",
      nota: "Es un diccionario de los conceptos de la teoría. Conviene tenerlo a mano mientras se lee cualquier otro texto de este módulo." },
    { m: "luhmann", tipo: "Libro", nivel: 1, lang: "en", acceso: "abierto",
      ref: "Baraldi, C., Corsi, G., & Esposito, E. (2021). <i>Unlocking Luhmann: A keyword introduction to systems theory</i> (K. Walker, Trad.). Bielefeld University Press.",
      url: "https://doi.org/10.14361/9783839456743",
      nota: "Es la versión en inglés y actualizada del glosario anterior, de acceso abierto. Puede servir a quien no encuentra la edición en español en la biblioteca." },
    { m: "luhmann", tipo: "Libro", nivel: 2, lang: "es", acceso: "biblioteca",
      ref: "Luhmann, N. (1996). <i>Introducción a la teoría de sistemas</i> (J. Torres Nafarrate, Ed.). Universidad Iberoamericana; ITESO; Anthropos.",
      url: "https://opac.biblio.iteso.mx/vufind/Record/000258151",
      nota: "Es la transcripción de las clases que Luhmann dictó en Bielefeld. Al tener el tono de una cátedra, es bastante más legible que sus libros y permite ver cómo él mismo explicaba la teoría a estudiantes." },
    { m: "luhmann", tipo: "Libro", nivel: 2, lang: "es", acceso: "abierto",
      ref: "Mascareño, A. (2010). <i>Diferenciación y contingencia en América Latina</i>. Ediciones Universidad Alberto Hurtado.",
      url: "https://ediciones.uahurtado.cl/en/?p=11754",
      nota: "Utiliza la teoría de sistemas para pensar la historia y la política latinoamericanas, y discute por qué en la región la política, el derecho o la economía no logran separarse del todo. Se puede descargar de forma gratuita desde la editorial." },
    { m: "luhmann", tipo: "Libro", nivel: 3, lang: "es", acceso: "biblioteca",
      ref: "Luhmann, N. (1998). <i>Sistemas sociales: lineamientos para una teoría general</i> (S. Pappe & B. Erker, Trads.; 2.ª ed.). Anthropos; Universidad Iberoamericana; CEJA.",
      url: "https://descubridor.academia.cl/Record/DIGANT0053",
      nota: "Es la obra central de Luhmann y no es un libro para comenzar. Recomiendo leer primero los capítulos sobre sentido y sobre doble contingencia, con el glosario al lado." },
    { m: "luhmann", tipo: "Artículo", nivel: 3, lang: "en", acceso: "abierto",
      ref: "Mascareño, A., Goles, E., & Ruz, G. A. (2016). Crisis in complex social systems: A social theory view illustrated with the Chilean case. <i>Complexity</i>, 21(S2), 13–23.",
      url: "https://doi.org/10.1002/cplx.21778", alt: "https://static.cepchile.cl/uploads/c22/2021/09/AC-Mascareno_et_al-2016-Complexity.pdf", altt: "PDF abierto",
      nota: "Es el puente entre las dos tradiciones de esta página, pues un sociólogo y dos matemáticos analizan una crisis chilena con herramientas de los sistemas complejos. Muestra que la teoría de sistemas y los modelos formales pueden trabajar juntos." },

    { m: "practica", tipo: "Curso", nivel: 1, lang: "en", acceso: "abierto",
      ref: "Mitchell, M. (s. f.). <i>Introduction to Complexity</i> [Curso en línea]. Complexity Explorer, Santa Fe Institute.",
      url: "https://www.complexityexplorer.org/courses/185-introduction-to-complexity",
      nota: "Es un curso gratuito y sin requisitos de matemáticas, que recorre los temas centrales del campo y usa NetLogo para los ejercicios. Recomiendo hacerlo después de leer las entradas de la primera parte." },
    { m: "practica", tipo: "Software", nivel: 1, lang: "en", acceso: "abierto",
      ref: "Wilensky, U. (1999). <i>NetLogo</i> [Software]. Center for Connected Learning and Computer-Based Modeling, Northwestern University.",
      url: "https://ccl.northwestern.edu/netlogo/", alt: "https://www.netlogoweb.org/", altt: "Versión web",
      nota: "Es el programa estándar para enseñar modelos basados en agentes. Es gratuito, se aprende en una tarde y trae una biblioteca con cientos de modelos listos para modificar (e.g., segregación, epidemias, votación y cooperación)." },
    { m: "practica", tipo: "Libro", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Wilensky, U., & Rand, W. (2015). <i>An introduction to agent-based modeling: Modeling natural, social, and engineered complex systems with NetLogo</i>. MIT Press.",
      url: "https://penguinrandomhouse.com/books/657114/an-introduction-to-agent-based-modeling-by-uri-wilensky-and-william-rand",
      nota: "Es el manual que acompaña a NetLogo, escrito por su creador, y enseña a diseñar, construir y analizar un modelo con ejercicios graduados." },
    { m: "practica", tipo: "Libro", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Page, S. E. (2018). <i>The model thinker: What you need to know to make data work for you</i>. Basic Books.",
      url: "https://www.hachettebookgroup.com/titles/scott-e-page/the-model-thinker/9780465094622/",
      nota: "Reúne más de veinte modelos (e.g., redes, difusión, juegos y dependencia de la trayectoria) y sostiene que conviene mirar un problema con varios modelos a la vez, pues cada uno muestra algo distinto." },
    { m: "practica", tipo: "Software", nivel: 3, lang: "en", acceso: "abierto",
      ref: "Project Mesa Team. (s. f.). <i>Mesa: Agent-based modeling in Python</i> [Software].",
      url: "https://github.com/projectmesa/mesa",
      nota: "Es una alternativa a NetLogo para quienes ya trabajan en Python, con visualización en el navegador y ejemplos como el modelo de Schelling." }
  ];

  var NIVEL = { 1: "Entrada", 2: "Intermedio", 3: "Avanzado" };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var themeBtn = document.getElementById("themeBtn");
  function syncThemeBtn() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    themeBtn.innerHTML = dark
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    themeBtn.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  }
  themeBtn.addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncThemeBtn();
  });
  syncThemeBtn();

  function card(r) {
    var links = '<a class="go" href="' + esc(r.url) + '" target="_blank" rel="noopener">Abrir</a>';
    if (r.alt) links += '<a class="go" href="' + esc(r.alt) + '" target="_blank" rel="noopener">' + esc(r.altt) + "</a>";
    return '<article class="rec"><div class="tags"><span class="tag t-' + r.nivel + '">' + NIVEL[r.nivel] + "</span>" +
      '<span class="tag">' + r.tipo + "</span>" +
      '<span class="tag">' + (r.lang === "es" ? "Español" : "Inglés") + "</span>" +
      (r.acceso === "abierto" ? '<span class="tag open">Acceso abierto</span>' : '<span class="tag">En biblioteca</span>') +
      '</div><p class="ref">' + r.ref + '</p><p class="nota">' + esc(r.nota) + '</p><div class="links">' + links + "</div></article>";
  }
  document.getElementById("lista").innerHTML = MODULOS.map(function (m) {
    var items = R.filter(function (r) { return r.m === m.key; }).sort(function (a, b) { return a.nivel - b.nivel; });
    return '<section class="modulo" id="m-' + m.key + '"><h3><span class="num">' + m.n + "</span>" + esc(m.t) + '</h3><p class="mdesc">' + esc(m.d) + "</p>" + items.map(card).join("") + "</section>";
  }).join("");

  /* Ilustraciones */
  var autos = document.getElementById("autos");
  if (autos) {
    var out = "", r = 190, cx = 480, cy = 270, angs = [];
    for (var i = 0; i < 17; i++) angs.push(40 + i * (300 / 17));
    for (var j = 0; j < 5; j++) angs.push(-12 + j * 8);
    angs.forEach(function (a, k) {
      var t = a * Math.PI / 180, x = cx + r * Math.cos(t), y = cy + r * Math.sin(t), jam = k >= 17;
      out += '<rect x="' + (x - 11) + '" y="' + (y - 6) + '" width="22" height="12" rx="3" transform="rotate(' + (a + 90) + " " + x + " " + y + ')" fill="' + (jam ? "var(--warm)" : "var(--text)") + '"/>';
    });
    autos.innerHTML = out;
  }
  var red = document.getElementById("red");
  if (red) {
    var N = 28, R2 = 205, c = [480, 270], pts = [], s = "";
    for (var a = 0; a < N; a++) { var th = a / N * 2 * Math.PI - Math.PI / 2; pts.push([c[0] + R2 * Math.cos(th) * 1.5, c[1] + R2 * Math.sin(th)]); }
    for (a = 0; a < N; a++) [1, 2].forEach(function (d) { var b = pts[(a + d) % N]; s += '<line x1="' + pts[a][0] + '" y1="' + pts[a][1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="var(--border-strong)" stroke-width="2"/>'; });
    [[0, 13], [4, 19], [9, 24], [16, 2]].forEach(function (e) { var p = pts[e[0]], q = pts[e[1]]; s += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke="var(--warm)" stroke-width="3"/>'; });
    pts.forEach(function (p, i) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i === 0 ? 13 : 9) + '" fill="' + (i === 0 ? "var(--warm)" : "var(--text)") + '"/>'; });
    red.innerHTML = s;
  }
  var pol = document.getElementById("poligonos");
  if (pol) {
    var cols = 16, rows = 9, w = 960 / cols, h = 540 / rows, g = "";
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      if ((x * 7 + y * 3) % 11 === 0) continue;
      var left = x < cols / 2 + Math.round(Math.sin(y * 1.1) * 2);
      var odd = (x * 5 + y * 13) % 17 === 0;
      var tri = left !== odd;
      var px = x * w + w / 2, py = y * h + h / 2, sz = Math.min(w, h) * 0.32;
      if (tri) g += '<polygon points="' + px + "," + (py - sz) + " " + (px - sz) + "," + (py + sz * 0.8) + " " + (px + sz) + "," + (py + sz * 0.8) + '" fill="var(--warm)"/>';
      else g += '<rect x="' + (px - sz * 0.85) + '" y="' + (py - sz * 0.85) + '" width="' + sz * 1.7 + '" height="' + sz * 1.7 + '" rx="3" fill="var(--text)"/>';
    }
    pol.innerHTML = g;
  }
})();
