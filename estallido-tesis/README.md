# Tesis sobre el estallido social

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23455927.svg)](https://doi.org/10.5281/zenodo.23455927)

Mapa longitudinal y base de referencias sobre las interpretaciones del estallido social chileno de 2019.

## Autoría

- **Tipología de las cuatro tesis** (transformacional, populista, estructural e insurreccional): Cristóbal Bellolio. Bellolio, C. [@cbellolio]. (2026, 17 de octubre). *A propósito del aniversario del 18O, hice un barrido por la literatura académica…* [Hilo]. X. https://x.com/cbellolio/status/2111498263115272614
- **Asignación de obras, subcorrientes, categorización emergente, variables y visualización**: elaboración propia (Fabián Belmar). Bellolio no participó en la ubicación de los autores.

La base no se limita a la tipología de Bellolio. Las obras que no calzan en las cuatro tesis van a «Otras lecturas», y la codificación de mecanismos causales ofrece una segunda clasificación, independiente de esa tipología (ver `datos/libro_de_codigos.csv`).

- Página: https://belmarfabian.github.io/estallido-tesis/
- Datos: `datos/tesis_estallido.csv` y `datos/tesis_estallido.json` (se generan con `datos/build.py`)
- Figura estática: `figura_mapa_estallido.png` (claro) y `figura_mapa_estallido_oscuro.png`

## Variables

| Campo | Descripción |
|---|---|
| id | Identificador único |
| etiqueta | Autor y año, como aparece en la figura |
| autores | Autores o fuente |
| anio | Año de publicación o declaración |
| tesis | Tesis de Bellolio, u «Otras lecturas» |
| subcorriente | Variante dentro de la tesis (elaboración propia) |
| mecanismos | Códigos de todos los mecanismos causales que invoca la obra, separados por `;` (ver libro de códigos) |
| mecanismo_principal | Código del mecanismo central del argumento |
| confianza_codificacion | `alta` (texto leído), `media` o `baja` (codificación desde resúmenes o reseñas) |
| registro | `investigacion` (artículo arbitrado, monografía académica basada en evidencia, encuesta), `ensayo` (libro o capítulo interpretativo sin evidencia original sistemática) u `opinion` (columna, crónica, entrevista, declaración o documento de gobierno) |
| rol | `principal` o `antecedente` (anterior al 18-O) |
| referencia | Referencia completa |
| fuente_url | Fuente que verifica autor, año y argumento |
| nota | Observaciones |

## Cómo citar

Belmar, F. (2026). *Tesis sobre el estallido social: mapa longitudinal y base de referencias* (versión 1.2.0) [Conjunto de datos]. Zenodo. https://doi.org/10.5281/zenodo.23455927

Si usas la tipología, cita también a Bellolio (2026).

Licencia de los datos: CC BY 4.0.
