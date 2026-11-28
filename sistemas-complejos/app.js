(function () {
  "use strict";

  /* Módulos: el orden es el de lectura sugerido. */
  var MODULOS = [
    { key: "vida", n: 0, parte: 1, t: "La complejidad en la vida diaria",
      d: "Antes de cualquier modelo conviene ver que la complejidad está en cosas cotidianas: en cómo funciona (o no funciona) un servicio público, en cómo se forma un barrio, en por qué un atasco aparece sin que nadie lo cause. Estos textos y juegos están escritos para un público general y en su mayoría en español. Cada uno indica qué módulo de la segunda parte contiene la teoría que lo explica." },
    { key: "intro", n: 1, t: "Qué es un sistema complejo",
      d: "Antes de los modelos conviene tener una idea clara de qué se entiende por complejidad, pues el término se usa de muchas maneras y no siempre con precisión. Estos recursos ofrecen un mapa general del campo y de sus conceptos básicos (interacción local, retroalimentación, ausencia de control central, orden que nadie diseñó)." },
    { key: "emergencia", n: 2, t: "De lo individual a lo colectivo",
      d: "El punto de partida de las ciencias de la complejidad en lo social es que el resultado colectivo no es la suma de las intenciones individuales. Un barrio puede segregarse aunque nadie quiera vivir segregado, y una canción puede volverse éxito por azar más que por calidad." },
    { key: "umbrales", n: 3, t: "Umbrales, contagios y puntos de quiebre",
      d: "Muchos fenómenos sociales cambian de golpe y no de forma gradual (una protesta que crece en horas, una norma que cae de un año a otro). Estos textos explican por qué ocurre y si es posible anticiparlo, una pregunta que tiene mucho sentido para pensar el Chile de la última década." },
    { key: "redes", n: 4, t: "Redes",
      d: "La forma en que estamos conectados importa tanto como lo que pensamos. Aquí están los textos que fundaron el análisis moderno de redes y algunas entradas amables para quien nunca ha visto un grafo." },
    { key: "cooperacion", n: 5, t: "Cooperación y gobierno de lo común",
      d: "Si nadie coordina, ¿cómo se explica que las personas cooperen y sostengan reglas en el tiempo? Este módulo reúne la respuesta de la teoría de juegos evolutiva y el trabajo empírico de Elinor Ostrom sobre comunidades que administran recursos sin mercado ni Estado." },
    { key: "luhmann", n: 6, t: "Complejidad y teoría de sistemas sociales",
      d: "La teoría de sistemas sociales de Niklas Luhmann también parte del problema de la complejidad, si bien lo aborda desde la comunicación y no desde los individuos. Este módulo propone una entrada gradual, con autores chilenos y latinoamericanos que han traducido esa teoría a problemas de la región." },
    { key: "practica", n: 7, t: "Herramientas para practicar",
      d: "Cursos, programas y manuales para pasar de leer modelos a construirlos. NetLogo no exige saber programar y es el mejor lugar para empezar; Mesa sirve a quien ya trabaja en Python." }
  ];

  /* nivel: 1 entrada, 2 intermedio, 3 avanzado. acceso: "abierto" | "biblioteca".
     Cada referencia se verificó en una fuente publicada (editorial, revista o repositorio). */
  var R = [
    /* ---------- 0. Divulgación ---------- */
    { m: "vida", teoria: "intro", tipo: "Documento", nivel: 1, lang: "es", acceso: "abierto",
      ref: "Waissbluth, M. (2008). <i>Sistemas complejos y gestión pública</i> (Documento de trabajo, Serie Gestión n.º 99). Departamento de Ingeniería Industrial, Universidad de Chile.",
      url: "https://www.mariowaissbluth.com/descargas/complejidad_y_gestion.pdf",
      nota: "El punto de partida. Waissbluth distingue entre sistemas complicados y sistemas complejos con ejemplos del Estado chileno, y explica por qué una institución pública no se reforma como se repara una máquina. Escrito para directivos y estudiantes, sin fórmulas." },
    { m: "vida", teoria: "cooperacion", tipo: "Documento", nivel: 1, lang: "es", acceso: "abierto",
      ref: "Waissbluth, M. (2008). <i>Gestión del cambio en el sector público</i> (Documento de trabajo, Serie Gestión n.º 109). Departamento de Ingeniería Industrial, Universidad de Chile.",
      url: "http://www.dii.uchile.cl/~ceges/publicaciones/109%20ceges%20MW.pdf",
      nota: "La continuación del anterior, que el propio autor pide leer después. Pasa del diagnóstico a la acción: qué ocurre cuando alguien intenta cambiar un servicio público, quiénes se resisten y por qué los planes diseñados desde arriba suelen fallar." },
    { m: "vida", teoria: "emergencia", tipo: "Libro", nivel: 1, lang: "es", acceso: "biblioteca",
      ref: "Johnson, S. (2003). <i>Sistemas emergentes: o qué tienen en común hormigas, neuronas, ciudades y software</i> (M. F. Ferré, Trad.). Turner; Fondo de Cultura Económica.",
      url: "https://opac.biblio.iteso.mx/vufind/Record/000307034",
      nota: "Un hormiguero no tiene jefe y aun así se organiza; un barrio de Manchester se especializa sin que nadie lo planifique. Johnson cuenta con ejemplos cotidianos cómo surge orden desde abajo, que es la intuición detrás de los modelos de Schelling y Epstein." },
    { m: "vida", teoria: "umbrales", tipo: "Libro", nivel: 2, lang: "es", acceso: "biblioteca",
      ref: "Ball, P. (2008). <i>Masa crítica: cambio, caos y complejidad</i>. Turner; Fondo de Cultura Económica.",
      url: "https://www.marcialpons.es/libros/masa-critica/9788475068510/",
      nota: "Los atascos, la bolsa o las modas leídos con las herramientas de la física, en un libro que ganó el premio Aventis de divulgación. Es largo; los capítulos sobre tráfico y sobre multitudes bastan para entender por qué lo social cambia de golpe." },
    { m: "vida", teoria: "redes", tipo: "Libro", nivel: 1, lang: "es", acceso: "biblioteca",
      ref: "Solé, R. (2009). <i>Redes complejas: del genoma a Internet</i>. Tusquets.",
      url: "https://www.planetadelibros.com/libro-redes-complejas/89623",
      nota: "Breve y en español. Un físico y biólogo explica para público general por qué Internet, las epidemias y el comercio comparten la misma forma de red, y qué se sigue de eso." },
    /* ---------- 1. Introducción ---------- */
    { m: "intro", tipo: "Artículo", nivel: 1, lang: "en", acceso: "abierto",
      ref: "Weaver, W. (1948). Science and complexity. <i>American Scientist</i>, 36(4), 536–544.",
      url: "https://repositorio.colmex.mx/pdf_viewer/7m01bq982?locale=es",
      nota: "El ensayo fundador, corto y sin fórmulas. Distingue los problemas de simplicidad (pocas variables), los de complejidad desorganizada (millones de variables, tratables con estadística) y los de complejidad organizada, que quedan al medio y son los que importan para lo social." },
    { m: "vida", teoria: "intro", tipo: "Curso", nivel: 1, lang: "en", acceso: "abierto",
      ref: "Mitchell, M. (s. f.). <i>Introduction to Complexity</i> [Curso en línea]. Complexity Explorer, Santa Fe Institute.",
      url: "https://www.complexityexplorer.org/courses/185-introduction-to-complexity",
      nota: "Curso gratuito, sin requisitos de matemáticas y disponible en cualquier momento. Recorre en diez unidades los temas centrales del campo (caos, autómatas celulares, cooperación, redes, escalamiento) y usa NetLogo para los ejercicios." },
    { m: "vida", teoria: "intro", tipo: "Libro", nivel: 1, lang: "en", acceso: "biblioteca",
      ref: "Mitchell, M. (2009). <i>Complexity: A Guided Tour</i>. Oxford University Press.",
      url: "https://search.worldcat.org/title/Complexity-:-a-guided-tour/oclc/216938473",
      nota: "El libro de divulgación que acompaña al curso anterior. Escrito para un público general, explica con paciencia de dónde vienen las ideas y por qué todavía no hay una sola definición de complejidad." },
    { m: "intro", tipo: "Artículo", nivel: 2, lang: "en", acceso: "abierto",
      ref: "Ladyman, J., Lambert, J., & Wiesner, K. (2013). What is a complex system? <i>European Journal for Philosophy of Science</i>, 3(1), 33–67.",
      url: "https://doi.org/10.1007/s13194-012-0056-8", alt: "https://philsci-archive.pitt.edu/9044/", altt: "Preprint",
      nota: "Revisa las definiciones de sistema complejo que circulan entre disciplinas y muestra que varias son vagas o insuficientes. Útil para no usar el término como sinónimo de «complicado»." },
    { m: "intro", tipo: "Libro", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Miller, J. H., & Page, S. E. (2007). <i>Complex Adaptive Systems: An Introduction to Computational Models of Social Life</i>. Princeton University Press.",
      url: "https://press.princeton.edu/node/22407",
      nota: "Pensado para cientistas sociales. Explica por qué modelar con agentes que se adaptan cambia las preguntas que podemos hacer sobre mercados, elecciones u organizaciones." },
    { m: "intro", tipo: "Libro", nivel: 3, lang: "en", acceso: "biblioteca",
      ref: "Byrne, D., & Callaghan, G. (2022). <i>Complexity Theory and the Social Sciences: The State of the Art</i> (2.ª ed.). Routledge.",
      url: "https://www.routledge.com/Complexity-Theory-and-the-Social-Sciences-The-State-of-the-Art/Byrne-Callaghan/p/book/9781032100869",
      nota: "Panorama de cómo la complejidad se ha incorporado a la teoría social y a los métodos (cualitativos, cuantitativos y mixtos). Recomendado para quien ya pasó por los módulos 2 a 5 y quiere discutir sus límites." },

    /* ---------- 2. Emergencia ---------- */
    { m: "vida", teoria: "emergencia", tipo: "Interactivo", nivel: 1, lang: "en", acceso: "abierto",
      ref: "Hart, V., & Case, N. (2014). <i>Parable of the Polygons</i> [Explicación interactiva].",
      url: "https://ncase.me/polygons/",
      nota: "Un juego de veinte minutos basado en el modelo de Schelling. Muestra cómo preferencias individuales moderadas producen un barrio segregado, y cómo una pequeña demanda de diversidad lo revierte. Ideal para la primera clase." },
    { m: "emergencia", tipo: "Artículo", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Schelling, T. C. (1971). Dynamic models of segregation. <i>Journal of Mathematical Sociology</i>, 1(2), 143–186.",
      url: "https://doi.org/10.1080/0022250X.1971.9989794",
      nota: "El artículo original detrás del juego anterior. Schelling hizo sus simulaciones con monedas sobre un tablero, lo que vale la pena replicar en sala antes de abrir un computador." },
    { m: "emergencia", tipo: "Artículo", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Salganik, M. J., Dodds, P. S., & Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. <i>Science</i>, 311(5762), 854–856.",
      url: "https://doi.org/10.1126/science.1121066",
      nota: "Un experimento con más de 14.000 personas en un mercado de canciones. Cuando los participantes veían lo que descargaban los demás, el éxito se volvió más desigual y menos predecible. Breve y muy discutible en clase." },
    { m: "emergencia", tipo: "Artículo", nivel: 3, lang: "en", acceso: "biblioteca",
      ref: "Epstein, J. M. (1999). Agent-based computational models and generative social science. <i>Complexity</i>, 4(5), 41–60.",
      url: "https://doi.org/10.1002/(SICI)1099-0526(199905/06)4:5<41::AID-CPLX9>3.0.CO;2-F",
      nota: "Defiende una idea exigente de explicación: para explicar un patrón social hay que poder hacerlo crecer desde la interacción de agentes. Buen texto para discutir qué cuenta como explicación en ciencias sociales." },
    { m: "emergencia", tipo: "Libro", nivel: 3, lang: "en", acceso: "biblioteca",
      ref: "Epstein, J. M., & Axtell, R. (1996). <i>Growing Artificial Societies: Social Science from the Bottom Up</i>. Brookings Institution Press; MIT Press.",
      url: "https://www.brookings.edu/books/growing-artificial-societies/",
      nota: "El clásico «Sugarscape»: una sociedad artificial en la que, a partir de reglas muy simples, aparecen desigualdad, comercio y migración. Más útil para hojear los experimentos que para leerlo entero." },

    /* ---------- 3. Umbrales ---------- */
    { m: "umbrales", tipo: "Artículo", nivel: 1, lang: "en", acceso: "biblioteca",
      ref: "Granovetter, M. (1978). Threshold models of collective behavior. <i>American Journal of Sociology</i>, 83(6), 1420–1443.",
      url: "https://doi.org/10.1086/226707",
      nota: "Cada persona se suma a una acción colectiva si ya se sumaron suficientes otros. El ejemplo del motín muestra que dos grupos casi idénticos pueden terminar en resultados opuestos. Se lee sin matemáticas y conversa bien con el 18-O." },
    { m: "umbrales", tipo: "Artículo", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Centola, D., & Macy, M. (2007). Complex contagions and the weakness of long ties. <i>American Journal of Sociology</i>, 113(3), 702–734.",
      url: "https://doi.org/10.1086/521848",
      nota: "Distingue entre lo que se contagia con un solo contacto (un rumor) y lo que exige refuerzo de varios (sumarse a un movimiento riesgoso). Para lo segundo, los lazos lejanos ayudan menos de lo que se cree." },
    { m: "umbrales", tipo: "Libro", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Centola, D. (2018). <i>How Behavior Spreads: The Science of Complex Contagions</i>. Princeton University Press.",
      url: "https://press.princeton.edu/node/6951",
      nota: "Versión extensa del artículo anterior, con experimentos en línea y aplicaciones a salud pública, tecnología y movimientos sociales. El capítulo introductorio basta para una sesión." },
    { m: "umbrales", tipo: "Artículo", nivel: 3, lang: "en", acceso: "biblioteca",
      ref: "Scheffer, M., Bascompte, J., Brock, W. A., Brovkin, V., Carpenter, S. R., Dakos, V., Held, H., van Nes, E. H., Rietkerk, M., & Sugihara, G. (2009). Early-warning signals for critical transitions. <i>Nature</i>, 461(7260), 53–59.",
      url: "https://doi.org/10.1038/nature08227",
      nota: "Viene de la ecología, pero su pregunta es social: ¿hay señales estadísticas (más varianza, más inercia) antes de un quiebre? Abre la discusión sobre si las crisis sociales pueden anticiparse y con qué datos." },

    /* ---------- 4. Redes ---------- */
    { m: "vida", teoria: "redes", tipo: "Interactivo", nivel: 1, lang: "en", acceso: "abierto",
      ref: "Case, N. (2018). <i>The Wisdom and/or Madness of Crowds</i> [Explicación interactiva].",
      url: "https://ncase.me/crowds/",
      nota: "Media hora dibujando redes y simulando contagios. Introduce, sin fórmulas, el contagio complejo, la paradoja de la mayoría y la diferencia entre lazos que unen al grupo y lazos que tienden puentes." },
    { m: "redes", tipo: "Artículo", nivel: 1, lang: "en", acceso: "biblioteca",
      ref: "Granovetter, M. S. (1973). The strength of weak ties. <i>American Journal of Sociology</i>, 78(6), 1360–1380.",
      url: "https://doi.org/10.1086/225469",
      nota: "Los conocidos, más que los amigos íntimos, son los que traen información nueva (por ejemplo, sobre un trabajo). Uno de los artículos más citados de la sociología y un buen ejemplo de cómo una idea simple ordena mucha evidencia." },
    { m: "redes", tipo: "Artículo", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Watts, D. J., & Strogatz, S. H. (1998). Collective dynamics of «small-world» networks. <i>Nature</i>, 393(6684), 440–442.",
      url: "https://doi.org/10.1038/30918",
      nota: "Muestra que bastan unos pocos atajos en una red muy local para que cualquier par de nodos quede a pocos pasos. Es la explicación formal de los «seis grados de separación»." },
    { m: "redes", tipo: "Artículo", nivel: 3, lang: "en", acceso: "biblioteca",
      ref: "Barabási, A.-L., & Albert, R. (1999). Emergence of scaling in random networks. <i>Science</i>, 286(5439), 509–512.",
      url: "https://doi.org/10.1126/science.286.5439.509",
      nota: "Propone que las redes crecen por apego preferencial (quien ya tiene muchas conexiones recibe más). Explica por qué en muchas redes unos pocos concentran casi todos los vínculos." },
    { m: "redes", tipo: "Libro", nivel: 2, lang: "en", acceso: "abierto",
      ref: "Barabási, A.-L. (2016). <i>Network Science</i>. Cambridge University Press.",
      url: "https://networksciencebook.com/",
      nota: "Manual completo con versión en línea gratuita, visualizaciones interactivas y diapositivas que el autor deja usar en clases. Los primeros cuatro capítulos son accesibles para pregrado." },

    /* ---------- 5. Cooperación ---------- */
    { m: "vida", teoria: "cooperacion", tipo: "Interactivo", nivel: 1, lang: "en", acceso: "abierto",
      ref: "Case, N. (2017). <i>The Evolution of Trust</i> [Explicación interactiva].",
      url: "https://ncase.me/trust/",
      nota: "Un juego sobre el dilema del prisionero repetido, inspirado en Axelrod. En treinta minutos muestra por qué la confianza crece o se derrumba según las reglas del juego y no solo según el carácter de los jugadores." },
    { m: "cooperacion", tipo: "Libro", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Axelrod, R. (1984). <i>The Evolution of Cooperation</i>. Basic Books.",
      url: "https://www.basicbooks.com/titles/robert-axelrod/the-evolution-of-cooperation/9780465005642/",
      nota: "El torneo de estrategias en que ganó «toma y daca» (cooperar primero y luego imitar al otro). Un clásico para discutir cómo surge la cooperación entre egoístas sin una autoridad que la imponga." },
    { m: "cooperacion", tipo: "Libro", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Ostrom, E. (1990). <i>Governing the Commons: The Evolution of Institutions for Collective Action</i>. Cambridge University Press.",
      url: "https://www.cambridge.org/core/books/governing-the-commons/A8BB63BC4A1433A50A3FB92EDBBB97D5",
      nota: "Pescadores, regantes y pastores que administran recursos comunes durante siglos sin mercado ni Estado. Desmiente la «tragedia de los comunes» con casos y propone principios de diseño que siguen discutiéndose." },
    { m: "cooperacion", tipo: "Artículo", nivel: 2, lang: "en", acceso: "abierto",
      ref: "Ostrom, E. (2010). Beyond markets and states: Polycentric governance of complex economic systems. <i>American Economic Review</i>, 100(3), 641–672.",
      url: "https://doi.org/10.1257/aer.100.3.641", alt: "https://dlc.dlib.indiana.edu/dlc/bitstream/handle/10535/7707/ostrom.pdf", altt: "Borrador abierto",
      nota: "Su conferencia del Nobel. Resume medio siglo de investigación y explica por qué los sistemas con muchos centros de decisión (gobernanza policéntrica) suelen funcionar mejor que la reforma única impuesta desde arriba." },

    /* ---------- 6. Luhmann ---------- */
    { m: "luhmann", tipo: "Libro", nivel: 1, lang: "es", acceso: "biblioteca",
      ref: "Rodríguez, D., & Arnold, M. (1991). <i>Sociedad y teoría de sistemas: elementos para la comprensión de la teoría de Niklas Luhmann</i>. Editorial Universitaria.",
      url: "https://repositorio.uchile.cl/handle/2250/122275",
      nota: "El primer libro en América Latina en presentar la teoría de Luhmann, escrito por dos profesores chilenos y reeditado varias veces. Sigue siendo la mejor puerta de entrada en español, pues parte de la teoría general de sistemas y llega a Luhmann paso a paso." },
    { m: "luhmann", tipo: "Libro", nivel: 1, lang: "es", acceso: "biblioteca",
      ref: "Corsi, G., Esposito, E., & Baraldi, C. (1996). <i>GLU: Glosario sobre la teoría social de Niklas Luhmann</i> (J. Torres Nafarrate, Trad.). Universidad Iberoamericana; ITESO; Anthropos.",
      url: "https://opac.biblio.iteso.mx/vufind/Record/000049455",
      nota: "Un diccionario de los conceptos de la teoría, con prólogo del propio Luhmann. Conviene tenerlo a mano mientras se lee cualquier otro texto del módulo." },
    { m: "luhmann", tipo: "Libro", nivel: 1, lang: "en", acceso: "abierto",
      ref: "Baraldi, C., Corsi, G., & Esposito, E. (2021). <i>Unlocking Luhmann: A Keyword Introduction to Systems Theory</i> (K. Walker, Trad.). Bielefeld University Press.",
      url: "https://doi.org/10.14361/9783839456743",
      nota: "Versión inglesa y actualizada del glosario anterior, de acceso abierto. Útil para quien no encuentra la edición en español en la biblioteca." },
    { m: "luhmann", tipo: "Libro", nivel: 2, lang: "es", acceso: "biblioteca",
      ref: "Luhmann, N. (1996). <i>Introducción a la teoría de sistemas</i> (J. Torres Nafarrate, Ed.). Universidad Iberoamericana; ITESO; Anthropos.",
      url: "https://opac.biblio.iteso.mx/vufind/Record/000258151",
      nota: "Transcripción de las clases que Luhmann dictó en Bielefeld. Al tener el tono de una cátedra oral, es bastante más legible que sus libros y permite escuchar cómo él mismo explicaba la teoría a estudiantes." },
    { m: "luhmann", tipo: "Libro", nivel: 3, lang: "es", acceso: "biblioteca",
      ref: "Luhmann, N. (1998). <i>Sistemas sociales: lineamientos para una teoría general</i> (S. Pappe & B. Erker, Trads.; 2.ª ed.). Anthropos; Universidad Iberoamericana; CEJA.",
      url: "https://descubridor.academia.cl/Record/DIGANT0053",
      nota: "La obra central de Luhmann. No es para empezar; se recomienda leer primero el capítulo sobre sentido y el de doble contingencia, con el glosario al lado." },
    { m: "luhmann", tipo: "Libro", nivel: 2, lang: "es", acceso: "abierto",
      ref: "Mascareño, A. (2010). <i>Diferenciación y contingencia en América Latina</i>. Ediciones Universidad Alberto Hurtado.",
      url: "https://ediciones.uahurtado.cl/en/?p=11754",
      nota: "Aplica la teoría de sistemas a la historia y la política latinoamericanas, y muestra por qué en la región la política, el derecho o la economía se separan de forma incompleta. Descarga gratuita en la editorial." },
    { m: "luhmann", tipo: "Artículo", nivel: 3, lang: "en", acceso: "abierto",
      ref: "Mascareño, A., Goles, E., & Ruz, G. A. (2016). Crisis in complex social systems: A social theory view illustrated with the Chilean case. <i>Complexity</i>, 21(S2), 13–23.",
      url: "https://doi.org/10.1002/cplx.21778", alt: "https://static.cepchile.cl/uploads/c22/2021/09/AC-Mascareno_et_al-2016-Complexity.pdf", altt: "PDF abierto",
      nota: "El puente entre los dos mundos de esta página: un sociólogo y dos matemáticos modelan la crisis de la educación chilena como un proceso de contagio. Muestra que la teoría de sistemas y los modelos formales pueden trabajar juntos." },

    /* ---------- 7. Práctica ---------- */
    { m: "practica", tipo: "Software", nivel: 1, lang: "en", acceso: "abierto",
      ref: "Wilensky, U. (1999). <i>NetLogo</i> [Software]. Center for Connected Learning and Computer-Based Modeling, Northwestern University.",
      url: "https://ccl.northwestern.edu/netlogo/", alt: "https://www.netlogoweb.org/", altt: "Versión web",
      nota: "El programa estándar para enseñar modelos basados en agentes. Es gratuito, se aprende en una tarde y trae una biblioteca con cientos de modelos listos (Schelling, epidemias, votación, cooperación) para modificar." },
    { m: "practica", tipo: "Libro", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Wilensky, U., & Rand, W. (2015). <i>An Introduction to Agent-Based Modeling: Modeling Natural, Social, and Engineered Complex Systems with NetLogo</i>. MIT Press.",
      url: "https://penguinrandomhouse.com/books/657114/an-introduction-to-agent-based-modeling-by-uri-wilensky-and-william-rand",
      nota: "El manual que acompaña a NetLogo, escrito por su creador. Enseña a diseñar, construir y analizar un modelo, con ejercicios graduados." },
    { m: "practica", tipo: "Libro", nivel: 2, lang: "en", acceso: "biblioteca",
      ref: "Page, S. E. (2018). <i>The Model Thinker: What You Need to Know to Make Data Work for You</i>. Basic Books.",
      url: "https://www.hachettebookgroup.com/titles/scott-e-page/the-model-thinker/9780465094622/",
      nota: "Una caja de herramientas con más de veinte modelos (redes, difusión, juegos, dependencia de la trayectoria) y un argumento: conviene mirar un problema con varios modelos a la vez, pues cada uno ilumina algo distinto." },
    { m: "practica", tipo: "Software", nivel: 3, lang: "en", acceso: "abierto",
      ref: "Project Mesa Team. (s. f.). <i>Mesa: Agent-based modeling in Python</i> [Software].",
      url: "https://github.com/projectmesa/mesa",
      nota: "Alternativa a NetLogo para quien ya usa Python, con visualización en el navegador y conexión directa con pandas. Trae ejemplos como el de Schelling y el de violencia civil de Epstein." }
  ];

  var NIVEL = { 1: "Entrada", 2: "Intermedio", 3: "Avanzado" };
  var TIPOS = ["Libro", "Artículo", "Documento", "Curso", "Interactivo", "Software"];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function plain(s) { return s.replace(/<[^>]+>/g, ""); }
  function norm(s) { return plain(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  /* Tema claro/oscuro, igual que en el resto del sitio */
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

  function teoriaLink(r) {
    if (!r.teoria) return "";
    var t = MODULOS.filter(function (x) { return x.key === r.teoria; })[0];
    return '<a class="teoria" href="#m-' + t.key + '">La teoría detrás: ' + t.n + ". " + esc(t.t) + " →</a>";
  }

  function card(r) {
    var mod = MODULOS.filter(function (x) { return x.key === r.m; })[0];
    var links = '<a class="go" href="' + esc(r.url) + '" target="_blank" rel="noopener">Abrir</a>';
    if (r.alt) links += '<a class="go alt" href="' + esc(r.alt) + '" target="_blank" rel="noopener">' + esc(r.altt || "Otra versión") + "</a>";
    return '<article class="rec" data-nivel="' + r.nivel + '">' +
      '<div class="tags"><span class="tag t-' + r.nivel + '">' + NIVEL[r.nivel] + "</span>" +
      '<span class="tag">' + r.tipo + "</span>" +
      '<span class="tag">' + (r.lang === "es" ? "Español" : "Inglés") + "</span>" +
      (r.acceso === "abierto" ? '<span class="tag open">Acceso abierto</span>' : '<span class="tag">En biblioteca</span>') +
      "</div>" +
      '<p class="ref">' + r.ref + "</p>" +
      '<p class="nota">' + esc(r.nota) + "</p>" +
      '<div class="links">' + links + teoriaLink(r) + "</div>" +
      "</article>";
  }

  /* Controles */
  var state = { mod: "todos", tipo: "todos", nivel: "todos", lang: "todos", abierto: false, q: "" };
  var modSel = document.getElementById("fMod");
  modSel.innerHTML = '<option value="todos">Todos los módulos</option>' + MODULOS.map(function (m) {
    return '<option value="' + m.key + '">' + (m.n ? m.n + ". " : "Divulgación: ") + esc(m.t) + "</option>";
  }).join("");
  document.getElementById("fTipo").innerHTML = '<option value="todos">Todos los tipos</option>' + TIPOS.map(function (t) {
    return '<option value="' + t + '">' + t + "</option>";
  }).join("");

  function bind(id, key, prop) {
    var el = document.getElementById(id);
    el.addEventListener(prop === "checked" ? "change" : "input", function () { state[key] = el[prop]; render(); });
  }
  bind("fMod", "mod", "value"); bind("fTipo", "tipo", "value"); bind("fNivel", "nivel", "value");
  bind("fLang", "lang", "value"); bind("fAb", "abierto", "checked"); bind("q", "q", "value");

  function pass(r) {
    if (state.mod !== "todos" && r.m !== state.mod) return false;
    if (state.tipo !== "todos" && r.tipo !== state.tipo) return false;
    if (state.nivel !== "todos" && String(r.nivel) !== state.nivel) return false;
    if (state.lang !== "todos" && r.lang !== state.lang) return false;
    if (state.abierto && r.acceso !== "abierto") return false;
    if (state.q) { var q = norm(state.q); if (norm(r.ref + " " + r.nota + " " + r.tipo).indexOf(q) < 0) return false; }
    return true;
  }

  function render() {
    var out = [], total = 0, parte2 = false;
    MODULOS.forEach(function (m) {
      var items = R.filter(function (r) { return r.m === m.key && pass(r); })
        .sort(function (a, b) { return a.nivel - b.nivel; });
      if (!items.length) return;
      total += items.length;
      if (m.parte === 1) out.push('<h2 class="parte"><span class="pnum">Parte I</span>Para empezar</h2>');
      else if (!parte2) { parte2 = true; out.push('<h2 class="parte"><span class="pnum">Parte II</span>La teoría detrás</h2><p class="mdesc">Cada módulo toma un fenómeno de la primera parte y presenta los textos que lo explican. Aquí la lectura se vuelve más exigente: los recursos están ordenados de entrada a avanzado.</p>'); }
      out.push('<section class="modulo" id="m-' + m.key + '"><h3>' + (m.n ? '<span class="num">' + m.n + "</span>" : "") + esc(m.t) + "</h3>" +
        '<p class="mdesc">' + esc(m.d) + "</p>" + items.map(card).join("") + "</section>");
    });
    document.getElementById("lista").innerHTML = out.length ? out.join("") : '<p class="vacio">Ningún recurso cumple esos filtros.</p>';
    document.getElementById("count").textContent = total + (total === 1 ? " recurso" : " recursos") + " de " + R.length;
  }
  render();

  document.getElementById("stats").textContent = R.length + " recursos · " + R.filter(function (r) { return r.m === "vida"; }).length + " de divulgación y " + R.filter(function (r) { return r.m !== "vida"; }).length + " de teoría · " +
    R.filter(function (r) { return r.acceso === "abierto"; }).length + " de acceso abierto · " +
    R.filter(function (r) { return r.lang === "es"; }).length + " en español";
})();
