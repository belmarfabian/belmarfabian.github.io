"""
Archivo unificado de la producción pública de Fabián Belmar.

Fuentes:
  - Google Scholar (papers)                 fuente='scholar'   seccion='academico'
  - Academia.edu (papers)                   fuente='academia'  seccion='academico'
  - CIPER Chile (columnas)                  fuente='ciper'     seccion='columnas'

Genera entradas.json con items unificados, ordenados por fecha desc.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import unicodedata
from dataclasses import dataclass, asdict, field
from typing import Any

import requests
from bs4 import BeautifulSoup, Tag

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept-Language": "es-CL,es;q=0.9",
}

GS_USER = "wr6beBsAAAAJ"
AE_URL = "https://independent.academia.edu/Fabi%C3%A1nBelmar"
CIPER_AUTOR = "https://www.ciperchile.cl/author/fabian-belmar/"
UTPRENSA_RSS = "https://www.reportedeprensa.utalca.cl/?paged={p}&feed=rss2&s=fabian+belmar"
UTPRENSA_QUERY_NAME = "fabian belmar"


@dataclass
class Item:
    id: str
    fuente: str        # scholar | academia | ciper
    seccion: str       # columnas | academico
    titulo: str
    url: str
    fecha: str
    imagen: str | None
    tipo: str          # paper | columna
    bajada: str = ""
    cuerpo_html: str = ""
    parrafos: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)


def descargar(sess: requests.Session, url: str, timeout: int = 30) -> str:
    r = sess.get(url, headers=HEADERS, timeout=timeout)
    r.raise_for_status()
    return r.text


def fecha_de_html(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    # 1) JSON-LD: revisar tanto el objeto raíz como cualquier objeto en @graph
    for s in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(s.string or "{}")
        except Exception:
            continue
        candidatos = []
        if isinstance(data, list):
            candidatos.extend(data)
        elif isinstance(data, dict):
            candidatos.append(data)
            if isinstance(data.get("@graph"), list):
                candidatos.extend(data["@graph"])
        for obj in candidatos:
            if not isinstance(obj, dict):
                continue
            for k in ("datePublished", "dateCreated", "uploadDate"):
                v = obj.get(k)
                if v:
                    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", v)
                    if m:
                        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    # 2) meta tags
    for sel, attrs in [
        (("meta", {"property": "article:published_time"}), "content"),
        (("meta", {"property": "article:modified_time"}), "content"),
        (("meta", {"name": "date"}), "content"),
        (("time", {"datetime": True}), "datetime"),
    ]:
        tag = soup.find(*sel)
        if tag:
            val = tag.get(attrs)
            if val:
                m = re.match(r"(\d{4})-(\d{2})-(\d{2})", val)
                if m:
                    return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    return ""


def limpiar_parrafo_html(p: Tag) -> str:
    for el in p.find_all(True):
        keep: dict[str, str] = {}
        if el.name == "a":
            href = el.get("href")
            if href:
                keep["href"] = href
                keep["target"] = "_blank"
                keep["rel"] = "noopener"
        el.attrs = keep
    return p.decode_contents().strip()


def extraer_cuerpo(soup: BeautifulSoup, sel: str) -> tuple[str, list[str]]:
    cont = soup.select_one(sel)
    if not cont:
        return "", []
    for s in cont.select("script, style, iframe, ins, aside, .related, .relacionados"):
        s.decompose()
    parrafos_html: list[str] = []
    parrafos_txt: list[str] = []
    for p in cont.find_all("p"):
        txt = p.get_text(" ", strip=True)
        if len(txt) < 5:
            continue
        html_p = limpiar_parrafo_html(p)
        if html_p:
            parrafos_html.append(f"<p>{html_p}</p>")
            parrafos_txt.append(txt)
    return "\n".join(parrafos_html), parrafos_txt


# ---------- Google Scholar ----------

def scholar_descubrir(sess: requests.Session, pausa: float) -> list[Item]:
    items: list[Item] = []
    seen: set[str] = set()
    cstart = 0
    while True:
        url = f"https://scholar.google.com/citations?user={GS_USER}&hl=es&cstart={cstart}&pagesize=100"
        try:
            html = descargar(sess, url, timeout=45)
        except requests.RequestException as e:
            print(f"[scholar] cstart={cstart} error: {e}", file=sys.stderr)
            break
        soup = BeautifulSoup(html, "html.parser")
        rows = soup.select("tr.gsc_a_tr")
        if not rows:
            break
        for tr in rows:
            a = tr.select_one(".gsc_a_at")
            if not a:
                continue
            titulo = a.get_text(strip=True)
            href = a.get("href", "")
            if href.startswith("/"):
                href = "https://scholar.google.com" + href
            grays = tr.select(".gs_gray")
            autores = grays[0].get_text(" ", strip=True) if grays else ""
            venue = grays[1].get_text(" ", strip=True) if len(grays) > 1 else ""
            year_tag = tr.select_one(".gsc_a_y .gsc_a_h, .gsc_a_y")
            year_txt = year_tag.get_text(strip=True) if year_tag else ""
            year = year_txt if re.fullmatch(r"\d{4}", year_txt) else ""
            iid = href.split("citation_for_view=", 1)[-1] if "citation_for_view=" in href else titulo
            iid = re.sub(r"[^A-Za-z0-9]", "", iid)[:64] or str(abs(hash(titulo)) % 10**12)
            if iid in seen:
                continue
            seen.add(iid)
            items.append(Item(
                id=f"scholar:{iid}",
                fuente="scholar",
                seccion="academico",
                titulo=titulo,
                url=href,
                fecha=f"{year}-01-01" if year else "",
                imagen=None,
                tipo="paper",
                bajada=venue,
                cuerpo_html=f"<p>{venue}</p>" if venue else "",
                parrafos=[venue] if venue else [],
            ))
        if len(rows) < 100:
            break
        cstart += 100
        time.sleep(pausa)
    print(f"[scholar] {len(items)} items", file=sys.stderr)
    return items


# ---------- Academia.edu ----------

def academia_descubrir(sess: requests.Session) -> list[Item]:
    items: list[Item] = []
    try:
        html = descargar(sess, AE_URL, timeout=45)
    except requests.RequestException as e:
        print(f"[academia] error: {e}", file=sys.stderr)
        return items
    soup = BeautifulSoup(html, "html.parser")
    for card in soup.select("[data-work-id]"):
        wid = card.get("data-work-id", "")
        a_tit = card.select_one(".wp-workCard--title a")
        if not a_tit:
            continue
        titulo = a_tit.get_text(strip=True)
        url = a_tit.get("href", "")
        ab = card.select_one(".js-work-more-abstract-untruncated") or card.select_one(".js-work-more-abstract-truncated")
        bajada = ab.get_text(" ", strip=True) if ab else ""
        year = ""
        m = re.search(r"\b(20[0-2]\d)\b", card.get_text(" ", strip=True))
        if m:
            year = m.group(1)
        items.append(Item(
            id=f"academia:{wid}",
            fuente="academia",
            seccion="academico",
            titulo=titulo,
            url=url,
            fecha=f"{year}-01-01" if year else "",
            imagen=None,
            tipo="paper",
            bajada=bajada,
            cuerpo_html=f"<p>{bajada}</p>" if bajada else "",
            parrafos=[bajada] if bajada else [],
        ))
    print(f"[academia] {len(items)} items", file=sys.stderr)
    return items


# ---------- CIPER ----------

def ciper_descubrir_y_parse(sess: requests.Session, pausa: float,
                            cache: dict[str, dict], refrescar: bool) -> list[Item]:
    items: list[Item] = []
    urls: set[str] = set()
    for p in range(1, 10):
        url = CIPER_AUTOR if p == 1 else f"{CIPER_AUTOR}page/{p}/"
        try:
            html = descargar(sess, url)
        except requests.RequestException as e:
            print(f"[ciper] page {p} error: {e}", file=sys.stderr)
            break
        soup = BeautifulSoup(html, "html.parser")
        nuevas = 0
        for a in soup.find_all("a", href=True):
            h = a["href"]
            if re.match(r"^https://www\.ciperchile\.cl/\d{4}/\d{2}/\d{2}/[^/]+/?$", h):
                if h not in urls:
                    urls.add(h)
                    nuevas += 1
        if not nuevas:
            break
        time.sleep(pausa)

    print(f"[ciper] {len(urls)} URLs descubiertas", file=sys.stderr)
    for url in sorted(urls):
        slug = url.rstrip("/").rsplit("/", 1)[-1]
        iid = f"ciper:{slug}"
        prev = cache.get(iid)
        if prev and not refrescar and prev.get("cuerpo_html"):
            items.append(Item(**{k: prev.get(k, "") for k in Item.__dataclass_fields__}))
            continue

        time.sleep(pausa)
        try:
            html = descargar(sess, url)
        except requests.RequestException as e:
            print(f"[ciper] {iid} error: {e}", file=sys.stderr)
            continue
        soup = BeautifulSoup(html, "html.parser")

        titulo = ""
        # CIPER tiene un h1 institucional ("En tiempos de incertidumbre…")
        # y otro que es el del artículo. El correcto suele tener clase article-big-text__title
        h1_art = soup.select_one("h1.article-big-text__title") or soup.select_one("article h1")
        if h1_art:
            titulo = h1_art.get_text(strip=True)
        if not titulo:
            og = soup.find("meta", property="og:title")
            if og:
                titulo = re.sub(r"\s*[-–—]\s*CIPER.*$", "", (og.get("content") or "").strip())

        bajada = ""
        og_d = soup.find("meta", property="og:description")
        if og_d:
            bajada = (og_d.get("content") or "").strip()

        imagen = None
        og_i = soup.find("meta", property="og:image")
        if og_i:
            imagen = (og_i.get("content") or "").strip() or None

        fecha = ""
        m = re.search(r"/(\d{4})/(\d{2})/(\d{2})/", url)
        if m:
            fecha = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
        if not fecha:
            fecha = fecha_de_html(html)

        # Cuerpo: probar selectores típicos de CIPER
        cuerpo_html, parrafos = "", []
        for sel in ["div.entry-content", "div.post-content", "article .content",
                    "[class*='content']"]:
            cuerpo_html, parrafos = extraer_cuerpo(soup, sel)
            if cuerpo_html:
                break

        items.append(Item(
            id=iid,
            fuente="ciper",
            seccion="columnas",
            titulo=titulo,
            url=url,
            fecha=fecha,
            imagen=imagen,
            tipo="columna",
            bajada=bajada,
            cuerpo_html=cuerpo_html,
            parrafos=parrafos,
        ))
        print(f"[ciper] {fecha} {titulo[:60]}", file=sys.stderr)
    return items


# ---------- OpenAlex ----------

OA_AUTHOR_ID = "A5016687705"


def openalex_descubrir(sess: requests.Session) -> list[Item]:
    items: list[Item] = []
    try:
        r = sess.get(
            f"https://api.openalex.org/works?filter=author.id:{OA_AUTHOR_ID}&per_page=100",
            headers={**HEADERS, "Accept": "application/json"},
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"[openalex] error: {e}", file=sys.stderr)
        return items

    for w in data.get("results", []):
        wid = w.get("id", "").rsplit("/", 1)[-1]
        titulo = w.get("title") or ""
        if not titulo:
            continue
        year = w.get("publication_year")
        fecha = f"{year}-01-01" if year else ""
        doi = w.get("doi") or ""
        primary = w.get("primary_location") or {}
        source = (primary.get("source") or {}).get("display_name") or ""
        url = doi or w.get("id", "")
        autores = ", ".join(
            (a.get("author") or {}).get("display_name", "")
            for a in (w.get("authorships") or [])[:6]
        )
        items.append(Item(
            id=f"openalex:{wid}",
            fuente="openalex",
            seccion="academico",
            titulo=titulo,
            url=url,
            fecha=fecha,
            imagen=None,
            tipo="paper",
            bajada=source + (f" · {year}" if year else ""),
            cuerpo_html=f"<p>{autores}</p><p><em>{source}</em></p>" if source else "",
            parrafos=[autores, source] if source else [autores],
        ))
    print(f"[openalex] {len(items)} items", file=sys.stderr)
    return items


# ---------- CEP Chile ----------

CEP_AUTOR_HINT = "fabián belmar"


def cep_descubrir(sess: requests.Session, pausa: float,
                  cache: dict[str, dict], refrescar: bool) -> list[Item]:
    """Busca en la API REST de CEP por términos vinculados a Fabián
    (Informe C22-CEP, primarias 2025, etc) y verifica autoría leyendo
    cada post."""
    items: list[Item] = []
    queries = [
        "informe C22 CEP",
        "elecciones 2025 CEP",
        "primarias 2025",
        "Fabián Belmar",
        "Mascareño Henríquez Belmar",
    ]
    seen_urls: set[str] = set()
    candidatas: set[str] = set()
    for q in queries:
        try:
            r = sess.get(
                "https://www.cepchile.cl/wp-json/wp/v2/search",
                params={"search": q, "per_page": 50},
                headers={**HEADERS, "Accept": "application/json"},
                timeout=20,
            )
            data = r.json() if r.ok else []
        except Exception:
            data = []
        for d in data:
            u = d.get("url", "")
            if "cepchile.cl" in u and "/investigacion/" in u:
                candidatas.add(u)
        time.sleep(pausa)

    print(f"[cep] {len(candidatas)} URLs candidatas", file=sys.stderr)

    for url in sorted(candidatas):
        if url in seen_urls:
            continue
        seen_urls.add(url)
        slug = url.rstrip("/").rsplit("/", 1)[-1]
        iid = f"cep:{slug}"
        prev = cache.get(iid)
        if prev and not refrescar and prev.get("titulo"):
            items.append(Item(**{k: prev.get(k, "") for k in Item.__dataclass_fields__}))
            continue

        time.sleep(pausa)
        try:
            html = descargar(sess, url, timeout=30)
        except requests.RequestException:
            continue
        # Verificar autoría: el cuerpo o página debe mencionar "fabián belmar"
        if "fabián belmar" not in html.lower() and "fabian belmar" not in html.lower():
            continue

        soup = BeautifulSoup(html, "html.parser")
        titulo = ""
        h1 = soup.find("h1")
        if h1:
            titulo = h1.get_text(strip=True)
        if not titulo:
            og = soup.find("meta", property="og:title")
            if og:
                titulo = re.sub(r"\s*[-–—|]\s*CEP.*$", "", (og.get("content") or "").strip())

        bajada = ""
        og_d = soup.find("meta", property="og:description")
        if og_d:
            bajada = (og_d.get("content") or "").strip()

        imagen = None
        og_i = soup.find("meta", property="og:image")
        if og_i:
            imagen = (og_i.get("content") or "").strip() or None

        fecha = fecha_de_html(html)

        cuerpo_html, parrafos = "", []
        for sel in ["div.entry-content", "article", "main"]:
            cuerpo_html, parrafos = extraer_cuerpo(soup, sel)
            if cuerpo_html:
                break

        items.append(Item(
            id=iid,
            fuente="cep",
            seccion="columnas",
            titulo=titulo,
            url=url,
            fecha=fecha,
            imagen=imagen,
            tipo="columna",
            bajada=bajada,
            cuerpo_html=cuerpo_html,
            parrafos=parrafos,
        ))
        print(f"[cep] {fecha} {titulo[:60]}", file=sys.stderr)
    return items


# ---------- Crossref ----------

CROSSREF_QUERY = "Fabián Belmar"
ORCID_ID = "0000-0003-4239-1874"


def crossref_descubrir(sess: requests.Session) -> list[Item]:
    items: list[Item] = []
    seen_dois: set[str] = set()
    try:
        r = sess.get(
            "https://api.crossref.org/works",
            params={
                "query.author": CROSSREF_QUERY,
                "rows": 100,
                "filter": "type:journal-article,type:proceedings-article,type:book-chapter,type:book",
            },
            headers={**HEADERS, "Accept": "application/json"},
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"[crossref] error: {e}", file=sys.stderr)
        return items

    for w in data.get("message", {}).get("items", []):
        autores = []
        for a in w.get("author", []) or []:
            full = (a.get("given", "") + " " + a.get("family", "")).strip()
            autores.append(full)
            # Verificar match por ORCID
            if a.get("ORCID", "").endswith(ORCID_ID):
                pass  # match seguro
        # filtrar a nivel autoría: requerir Belmar + Fabián juntos
        es_de_el = any(
            "belmar" in a.lower() and ("fabi" in a.lower() or a.startswith("F"))
            for a in autores
        )
        if not es_de_el:
            continue

        doi = w.get("DOI", "").strip()
        if not doi or doi in seen_dois:
            continue
        seen_dois.add(doi)

        titulo = (w.get("title") or [""])[0]
        year = None
        try:
            year = w.get("published", {}).get("date-parts", [[None]])[0][0]
        except Exception:
            pass
        revista = (w.get("container-title") or [""])[0]

        items.append(Item(
            id=f"crossref:{re.sub(r'[^A-Za-z0-9]', '', doi)[-32:]}",
            fuente="crossref",
            seccion="academico",
            titulo=titulo,
            url=f"https://doi.org/{doi}",
            fecha=f"{year}-01-01" if year else "",
            imagen=None,
            tipo="paper",
            bajada=revista + (f" · {year}" if year else ""),
            cuerpo_html=f"<p>{', '.join(autores[:8])}</p><p><em>{revista}</em></p>" if revista else "",
            parrafos=[", ".join(autores[:8]), revista] if revista else [", ".join(autores[:8])],
        ))
    print(f"[crossref] {len(items)} items", file=sys.stderr)
    return items


# ---------- UAI noticias ----------

UAI_QUERIES = ["fabian belmar", "fabián belmar"]


def uai_descubrir(sess: requests.Session, pausa: float, cache: dict, refrescar: bool) -> list[Item]:
    items: list[Item] = []
    candidatas: set[str] = set()
    for q in UAI_QUERIES:
        try:
            r = sess.get(
                "https://www.uai.cl/wp-json/wp/v2/search",
                params={"search": q, "per_page": 50},
                headers={**HEADERS, "Accept": "application/json"},
                timeout=20,
            )
            data = r.json() if r.ok else []
        except Exception:
            data = []
        if not isinstance(data, list):
            continue
        for d in data:
            u = d.get("url", "")
            if "uai.cl" in u and ("/noticias/" in u or "/news" in u or "/blog" in u):
                candidatas.add(u)
        time.sleep(pausa)

    print(f"[uai] {len(candidatas)} URLs candidatas", file=sys.stderr)
    for url in sorted(candidatas):
        slug = url.rstrip("/").rsplit("/", 1)[-1]
        iid = f"uai:{slug}"
        prev = cache.get(iid)
        if prev and not refrescar and prev.get("titulo"):
            items.append(Item(**{k: prev.get(k, "") for k in Item.__dataclass_fields__}))
            continue

        time.sleep(pausa)
        try:
            html = descargar(sess, url, timeout=30)
        except requests.RequestException:
            continue
        if "fabián belmar" not in html.lower() and "fabian belmar" not in html.lower():
            continue

        soup = BeautifulSoup(html, "html.parser")
        titulo = ""
        h1 = soup.find("h1")
        if h1: titulo = h1.get_text(strip=True)
        if not titulo:
            og = soup.find("meta", property="og:title")
            if og: titulo = re.sub(r"\s*[-–—|]\s*UAI.*$", "", (og.get("content") or "").strip())

        bajada = ""
        og_d = soup.find("meta", property="og:description")
        if og_d: bajada = (og_d.get("content") or "").strip()

        imagen = None
        og_i = soup.find("meta", property="og:image")
        if og_i: imagen = (og_i.get("content") or "").strip() or None

        fecha = fecha_de_html(html)

        cuerpo_html, parrafos = "", []
        for sel in ["article", "div.entry-content", "main"]:
            cuerpo_html, parrafos = extraer_cuerpo(soup, sel)
            if cuerpo_html: break

        items.append(Item(
            id=iid, fuente="uai", seccion="prensa",
            titulo=titulo, url=url, fecha=fecha, imagen=imagen,
            tipo="aparicion", bajada=bajada,
            cuerpo_html=cuerpo_html, parrafos=parrafos,
        ))
        print(f"[uai] {fecha} {titulo[:60]}", file=sys.stderr)
    return items


# ---------- Otros (URLs manuales) ----------

OTROS_URLS = [
    # Apariciones específicas descubiertas vía Google site-restricted
    "https://www.adprensa.cl/vocerias-institucionales/vocerias-universidad-de-talca-voceros-u-mayor/",
    "https://www.juridicasysociales.utalca.cl/?noticias=docentes-de-administracion-publica-participaron-del-primero-congreso-patagonico-de-descentralizacion",
    "https://www.cap.utalca.cl/acerca-del-cap/",
    "https://santiago.utalca.cl/centro-de-analisis-politico-de-la-facultad-logra-publicar-ocho-articulos-en-destacadas-revistas-internacionales-en-tan-solo-un-semestre/",
    "https://caputalca.substack.com/p/articulo-clientelismo-en-la-gestion",
    "https://radio.uchile.cl/2024/10/31/debacle-futbolistica-y-economica-los-factores-que-urgen-a-la-anfp-y-que-acelerarian-la-reforma-a-las-sad/",
]


def otros_descubrir(sess: requests.Session, pausa: float, cache: dict, refrescar: bool) -> list[Item]:
    items: list[Item] = []
    for url in OTROS_URLS:
        slug = re.sub(r"[^A-Za-z0-9]+", "-", url)[-40:]
        iid = f"otros:{slug}"
        prev = cache.get(iid)
        if prev and not refrescar and prev.get("titulo"):
            items.append(Item(**{k: prev.get(k, "") for k in Item.__dataclass_fields__}))
            continue
        time.sleep(pausa)
        try:
            html = descargar(sess, url, timeout=30)
        except requests.RequestException as e:
            print(f"[otros] err {url[:50]}: {e}", file=sys.stderr)
            continue
        soup = BeautifulSoup(html, "html.parser")
        titulo = ""
        og_t = soup.find("meta", property="og:title")
        if og_t: titulo = (og_t.get("content") or "").strip()
        if not titulo:
            h1 = soup.find("h1")
            if h1: titulo = h1.get_text(strip=True)
        if not titulo and soup.title:
            titulo = soup.title.get_text(strip=True)

        bajada = ""
        og_d = soup.find("meta", property="og:description")
        if og_d: bajada = (og_d.get("content") or "").strip()
        imagen = None
        og_i = soup.find("meta", property="og:image")
        if og_i: imagen = (og_i.get("content") or "").strip() or None
        fecha = fecha_de_html(html)

        # detectar dominio para clasificar
        dominio = re.search(r"://(?:www\.)?([^/]+)", url).group(1)
        items.append(Item(
            id=iid, fuente="otros", seccion="prensa",
            titulo=titulo, url=url, fecha=fecha, imagen=imagen,
            tipo="aparicion",
            bajada=f"{dominio} · {bajada}" if bajada else dominio,
            cuerpo_html="", parrafos=[],
        ))
        print(f"[otros] {fecha} {dominio} {titulo[:60]}", file=sys.stderr)
    return items


# ---------- Substack caputalca ----------

CAPUTALCA_RSS = "https://caputalca.substack.com/feed"


def substack_descubrir(sess: requests.Session) -> list[Item]:
    items: list[Item] = []
    try:
        r = sess.get(CAPUTALCA_RSS, headers=HEADERS, timeout=30)
        r.raise_for_status()
    except Exception as e:
        print(f"[substack] error: {e}", file=sys.stderr)
        return items

    soup = BeautifulSoup(r.text, "lxml-xml")
    for it in soup.find_all("item"):
        ce = it.find("encoded")
        body = ce.get_text() if ce else ""
        title_tag = it.find("title")
        title = title_tag.get_text(strip=True) if title_tag else ""
        link_tag = it.find("link")
        link = link_tag.get_text(strip=True) if link_tag else ""
        creator = it.find("creator")
        autor = creator.get_text(strip=True) if creator else ""

        # Sólo nos interesan los de Fabián (autor o que lo mencionen
        # explícitamente como autor del artículo)
        es_de_el = "belmar" in autor.lower()
        if not es_de_el:
            # También verificar si el cuerpo cita "Por Fabián Belmar"
            if re.search(r"por\s+fabi[áa]n\s+belmar", body, re.IGNORECASE):
                es_de_el = True
        if not es_de_el:
            continue

        pub = it.find("pubDate")
        fecha = ""
        if pub and pub.text:
            m = re.search(r"(\d{1,2})\s+(\w{3})\s+(\d{4})", pub.text)
            if m:
                meses = {"Jan":"01","Feb":"02","Mar":"03","Apr":"04","May":"05","Jun":"06",
                         "Jul":"07","Aug":"08","Sep":"09","Oct":"10","Nov":"11","Dec":"12"}
                d, mes_en, y = m.groups()
                if mes_en in meses:
                    fecha = f"{int(y):04d}-{meses[mes_en]}-{int(d):02d}"

        # imagen y bajada del HTML
        inner = BeautifulSoup(body, "html.parser")
        bajada = ""
        first_p = inner.find("p")
        if first_p:
            bajada = first_p.get_text(" ", strip=True)[:280]
        first_img = inner.find("img")
        imagen = first_img["src"] if first_img and first_img.get("src") else None

        slug = link.rstrip("/").rsplit("/", 1)[-1] or str(abs(hash(link)) % 10**12)
        items.append(Item(
            id=f"substack:{slug}",
            fuente="substack",
            seccion="columnas",
            titulo=title,
            url=link,
            fecha=fecha,
            imagen=imagen,
            tipo="columna",
            bajada=bajada,
            cuerpo_html="",
            parrafos=[bajada] if bajada else [],
        ))
    print(f"[substack] {len(items)} items", file=sys.stderr)
    return items


# ---------- Reporte de Prensa UTalca ----------

def utprensa_descubrir_y_parse(sess: requests.Session, pausa: float,
                                max_paginas: int = 200) -> list[Item]:
    import urllib3
    urllib3.disable_warnings()
    items: list[Item] = []
    seen_urls: set[str] = set()

    def _sin_tildes(s: str) -> str:
        return unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode().lower()

    nombre_lower = _sin_tildes(UTPRENSA_QUERY_NAME)

    for p in range(1, max_paginas + 1):
        url = UTPRENSA_RSS.format(p=p)
        time.sleep(pausa)
        try:
            r = sess.get(url, headers=HEADERS, timeout=30, verify=False)
            r.raise_for_status()
        except requests.RequestException:
            break
        rss = BeautifulSoup(r.text, "lxml-xml")
        rss_items = rss.find_all("item")
        if not rss_items:
            break
        nuevas = 0
        for item in rss_items:
            pub = item.find("pubDate")
            fecha = ""
            if pub and pub.text:
                m = re.search(r"(\d{1,2})\s+(\w{3})\s+(\d{4})", pub.text)
                if m:
                    meses = {"Jan":"01","Feb":"02","Mar":"03","Apr":"04",
                             "May":"05","Jun":"06","Jul":"07","Aug":"08",
                             "Sep":"09","Oct":"10","Nov":"11","Dec":"12"}
                    d, mes_en, y = m.groups()
                    if mes_en in meses:
                        fecha = f"{int(y):04d}-{meses[mes_en]}-{int(d):02d}"

            ce = item.find("encoded")
            if not ce:
                continue
            html = ce.get_text() if ce.string is None else ce.string
            if not html:
                continue
            inner = BeautifulSoup(html, "html.parser")

            medio_actual = ""
            for el in inner.find_all(True):
                if el.name in ("b", "strong"):
                    t = el.get_text(" ", strip=True)
                    if t and len(t) < 80:
                        medio_actual = t
                    continue
                if el.name != "a" or not el.get("href"):
                    continue
                txt = el.get_text(" ", strip=True)
                href = el["href"]
                if nombre_lower not in _sin_tildes(txt):
                    continue
                if href in seen_urls:
                    continue
                seen_urls.add(href)

                titulo = txt.strip().rstrip(".")
                if len(titulo) > 240:
                    primer_punto = titulo.find(". ")
                    if 30 < primer_punto < 240:
                        titulo = titulo[:primer_punto]

                iid = re.sub(r"[^A-Za-z0-9]", "", href)[-32:] or str(abs(hash(href)) % 10**12)
                items.append(Item(
                    id=f"utprensa:{iid}",
                    fuente="utprensa",
                    seccion="prensa",
                    titulo=titulo or f"Aparición en {medio_actual}",
                    url=href,
                    fecha=fecha,
                    imagen=None,
                    tipo="aparicion",
                    bajada=medio_actual,
                    cuerpo_html="",
                    parrafos=[],
                ))
                nuevas += 1

        print(f"[utprensa] page {p}: +{nuevas} (acum {len(items)})", file=sys.stderr)

    print(f"[utprensa] total: {len(items)}", file=sys.stderr)
    return items


# ---------- Tags automáticos ----------

TAG_PATTERNS: list[tuple[str, list[str]]] = [
    ("Fútbol", ["futbol", "fifa", "anfp", "conmebol", "copa america"]),
    ("Corrupción", ["corrupcion"]),
    ("Clientelismo", ["clientelismo", "clientelar"]),
    ("Constitución", ["constitucion", "convencion constitucional"]),
    ("Elecciones", ["eleccion", "elecciones", "electoral"]),
    ("Partidos", ["partido politico", "partidos politicos"]),
    ("Chile", ["chile chileno", "chile chilena"]),
    ("Computacional", ["computacional", "agent based", "redes sociales", "social media"]),
]


def _norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()
    return s


def asignar_tags(it: Item) -> list[str]:
    blob = _norm(" ".join([it.titulo or "", it.bajada or "", " ".join(it.parrafos or [])]))
    out: list[str] = []
    for canon, kws in TAG_PATTERNS:
        for kw in kws:
            if re.search(r"(?<![a-z0-9])" + re.escape(_norm(kw)) + r"(?![a-z0-9])", blob):
                out.append(canon)
                break
    return out


# ---------- Caché y unificador ----------

def cargar_existente(path: str) -> dict[str, dict]:
    if not os.path.exists(path):
        return {}
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return {c["id"]: c for c in data.get("items", [])}
    except Exception:
        return {}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--salida", default="entradas.json")
    ap.add_argument("--pausa", type=float, default=0.7)
    ap.add_argument("--refrescar", action="store_true")
    ap.add_argument("--solo", nargs="+",
                    choices=["scholar", "academia", "ciper", "utprensa",
                             "openalex", "cep", "substack", "crossref",
                             "uai", "otros"],
                    help="ejecutar solo estas fuentes")
    args = ap.parse_args()

    fuentes = set(args.solo) if args.solo else {
        "scholar", "academia", "ciper", "utprensa", "openalex", "cep",
        "substack", "crossref", "uai", "otros"
    }
    sess = requests.Session()
    cache = cargar_existente(args.salida)

    todos: list[Item] = []

    if "scholar" in fuentes:
        todos += scholar_descubrir(sess, args.pausa)
    if "academia" in fuentes:
        todos += academia_descubrir(sess)
    if "ciper" in fuentes:
        todos += ciper_descubrir_y_parse(sess, args.pausa, cache, args.refrescar)
    if "openalex" in fuentes:
        todos += openalex_descubrir(sess)
    if "crossref" in fuentes:
        todos += crossref_descubrir(sess)
    if "cep" in fuentes:
        todos += cep_descubrir(sess, args.pausa, cache, args.refrescar)
    if "uai" in fuentes:
        todos += uai_descubrir(sess, args.pausa, cache, args.refrescar)
    if "otros" in fuentes:
        todos += otros_descubrir(sess, args.pausa, cache, args.refrescar)
    if "substack" in fuentes:
        todos += substack_descubrir(sess)
    if "utprensa" in fuentes:
        todos += utprensa_descubrir_y_parse(sess, args.pausa)

    # Mantener cache de fuentes no procesadas
    presentes = {it.id for it in todos}
    for iid, c in cache.items():
        f = iid.split(":", 1)[0] if ":" in iid else ""
        if f in fuentes:
            continue
        if iid in presentes:
            continue
        try:
            todos.append(Item(**{k: c.get(k, "") for k in Item.__dataclass_fields__}))
        except TypeError:
            pass

    # Dedupe académico por título normalizado
    PRIO = {"crossref": 0, "openalex": 1, "scholar": 2, "academia": 3}

    def _norm_t(t: str) -> str:
        t = unicodedata.normalize("NFD", t).encode("ascii", "ignore").decode().lower()
        return re.sub(r"[^a-z0-9]+", " ", t).strip()

    by_key: dict[str, Item] = {}
    no_dedup: list[Item] = []
    for it in todos:
        if it.seccion != "academico":
            no_dedup.append(it); continue
        key = _norm_t(it.titulo)
        if not key or len(key) < 8:
            no_dedup.append(it); continue
        prev = by_key.get(key)
        if prev is None:
            by_key[key] = it
        elif PRIO.get(it.fuente, 9) < PRIO.get(prev.fuente, 9):
            by_key[key] = it
    n_dedup = sum(1 for it in todos if it.seccion == "academico") - len(by_key)
    todos = no_dedup + list(by_key.values())

    # Tags
    for it in todos:
        it.tags = asignar_tags(it)

    todos.sort(key=lambda c: (c.fecha or "0000-00-00", c.id), reverse=True)

    payload = {
        "fuentes": ["scholar", "academia", "ciper"],
        "total": len(todos),
        "items": [asdict(c) for c in todos],
    }
    with open(args.salida, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"\nguardado {args.salida} con {len(todos)} entradas (-{n_dedup} dups)", file=sys.stderr)
    from collections import Counter
    by_f = Counter(it.fuente for it in todos)
    print(f"  por fuente: {dict(by_f)}", file=sys.stderr)


if __name__ == "__main__":
    main()
