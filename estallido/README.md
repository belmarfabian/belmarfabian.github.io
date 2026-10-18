# Tesis sobre el estallido social

Mapa longitudinal y base de referencias sobre las interpretaciones del estallido social chileno de 2019.
La tipología de cuatro tesis (transformacional, populista, estructural, insurreccional) es de Cristóbal Bellolio.
La clasificación de cada obra es de Fabián Belmar.

- Página: https://belmarfabian.github.io/estallido/
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

Belmar, F. (2026). *Tesis sobre el estallido social: mapa longitudinal y base de referencias* (versión 1.0) [Conjunto de datos]. https://belmarfabian.github.io/estallido/

Licencia de los datos: CC BY 4.0.
