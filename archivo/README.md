# Fabián Belmar — Archivo

Archivo web de columnas, papers y apariciones de [Fabián Belmar](https://www.researchgate.net/profile/Fabian-Belmar-3) — doctorando en Procesos e Instituciones Políticas, Universidad Adolfo Ibáñez.

## Estructura

- `index.html`, `styles.css`, `app.js` — sitio estático
- `entradas.json` — datos generados por el scraper
- `scraper.py` — descubre publicaciones desde Google Scholar, Academia.edu y CIPER Chile

## Ver localmente

```bash
python -m http.server 8766
# abrir http://127.0.0.1:8766/
```

## Actualizar

```bash
pip install requests beautifulsoup4
python scraper.py
```

Caché: las columnas con cuerpo ya descargado no se vuelven a bajar.

## Créditos

Los textos pertenecen a sus autores y a CIPER Chile y otras revistas. Este sitio es un archivo independiente con fines de lectura y consulta.
