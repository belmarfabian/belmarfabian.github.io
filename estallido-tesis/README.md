# Las tesis de Bellolio sobre el estallido social

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23455927.svg)](https://doi.org/10.5281/zenodo.23455927)

Mapa longitudinal y base de referencias sobre las interpretaciones del estallido social chileno de 2019.

## Autoría

- **Tipología de las cuatro tesis** (transformacional, populista, estructural e insurreccional): Cristóbal Bellolio. Bellolio, C. [@cbellolio]. (2026, 17 de octubre). *A propósito del aniversario del 18O, hice un barrido por la literatura académica…* [Hilo]. X. https://x.com/cbellolio/status/2111498263115272614
- **Asignación de obras, subcorrientes, variables y visualización**: elaboración propia (Fabián Belmar). Bellolio no participó en la ubicación de los autores.

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
| subcorriente | Variante dentro de la tesis |
| registro | `academico` (literatura académica y ensayo) u `opinion` (discurso político, entrevista, columna) |
| enfoque | `normativo` (la explicación va unida a una toma de posición) o `empirico` (explica sin juzgar el estallido). Clasificación preliminar |
| rol | `principal` o `antecedente` (anterior al 18-O) |
| referencia | Referencia completa |
| fuente_url | Fuente que verifica autor, año y argumento |
| nota | Observaciones |

## Cómo citar

Belmar, F. (2026). *Las tesis de Bellolio sobre el estallido social: mapa longitudinal y base de referencias* (versión 1.0.1) [Conjunto de datos]. Zenodo. https://doi.org/10.5281/zenodo.23455927

Si usas la tipología, cita también a Bellolio (2026).

Licencia de los datos: CC BY 4.0.
