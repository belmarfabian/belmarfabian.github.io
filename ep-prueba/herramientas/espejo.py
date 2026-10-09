#!/usr/bin/env python3
"""Copia de prueba de la revista Estudios Públicos (estudiospublicos.cl, OJS 3.1).

Baja la portada, las páginas del menú, el archivo de números, los números
recientes y especiales, y sus artículos. Los deja en ep-prueba/ con los enlaces
reescritos para que funcionen en belmarfabian.github.io/ep-prueba/.

- Lo que no está copiado (números antiguos, PDF, login, búsqueda) apunta al sitio real.
- Las imágenes de /public/ se cargan desde estudiospublicos.cl.
- El tema (CSS, JS, fuentes, imágenes de /plugins/themes/ceptheme/) se copia local.
- Se quitan analítica (Google, Meta, Clarity) y Rocket Loader de Cloudflare.
- Los envíos a Zapier quedan desactivados.
- Cada página carga ep-cambios/ep-cambios.css y .js: ahí van las ediciones.

Uso:  python3 -I espejo.py [--sin-descarga]
"""
import hashlib, html, json, os, re, subprocess, sys, time
from urllib.parse import quote, unquote, urljoin, urlsplit

BASE = 'https://estudiospublicos.cl'
J = '/index.php/cep'
PREFIX = '/ep-prueba'
AQUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(AQUI)                      # .../ep-prueba
CACHE = os.environ.get('EP_CACHE', os.path.join(os.path.expanduser('~'), '.cache', 'ep-espejo'))
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36'
SIN_DESCARGA = '--sin-descarga' in sys.argv
DESACTIVADO = PREFIX + '/ep-datos/desactivado.json'

FIJAS = ['', 'issue/archive', 'online-first', 'audioVisuals', 'busqueda', 'concepto',
         'comite-editorial', 'equipo-edicion', 'indexaciones', 'secciones', 'numeros-especiales',
         'politicas-y-etica', 'revisores', 'guia-para-autores', 'guia-para-revisores',
         'enviar-articulo', 'ventanilla-abierta', 'contacto', 'about/subscriptions', 'about/privacy']


def bajar(url, binario=False):
    os.makedirs(CACHE, exist_ok=True)
    f = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest())
    if not os.path.exists(f):
        if SIN_DESCARGA:
            return None
        r = subprocess.run(['curl', '-s', '-L', '-A', UA, '-o', f, '-w', '%{http_code}', '-m', '60',
                            quote(url, safe=':/?&=#%+,;~@!$*()')],
                           capture_output=True, text=True)
        time.sleep(0.4)
        if r.stdout.strip() != '200':
            print('  !', r.stdout.strip(), url)
            if os.path.exists(f):
                os.remove(f)
            return None
    data = open(f, 'rb').read()
    return data if binario else data.decode('utf-8', 'replace')


def clave(sub):
    """'/issue/view/183/' -> 'issue/view/183'; 'index' -> ''."""
    k = sub.strip('/')
    return '' if k == 'index' else k


def ruta_local(k):
    return PREFIX + '/' + (k + '/' if k else '')


def enlaces_revista(s):
    out = set()
    for m in re.finditer(r'(?:https?://(?:www\.)?estudiospublicos\.cl)?' + re.escape(J) + r'(/[^"\'\s<>?#]*)?(?=["\'\s<>?#])', s):
        out.add(clave(m.group(1) or ''))
    return out


# ---------- 1. qué páginas copiar ----------
def descubrir():
    paginas = {}
    for k in FIJAS:
        s = bajar(BASE + J + ('/' + k if k else ''))
        if s:
            paginas[k] = s
    # archivo paginado
    n = 2
    while True:
        k = 'issue/archive/%d' % n
        if not any(k in enlaces_revista(s) for s in paginas.values()):
            break
        s = bajar(BASE + J + '/' + k)
        if not s:
            break
        paginas[k] = s
        n += 1
    # números: los de la portada y los especiales
    numeros = set()
    for k in ['', 'numeros-especiales', 'online-first']:
        numeros |= {x for x in enlaces_revista(paginas.get(k, '')) if re.fullmatch(r'issue/view/[^/]+', x)}
    for k in sorted(numeros):
        s = bajar(BASE + J + '/' + k)
        if s:
            paginas[k] = s
    # artículos de esos números, de la portada y de online-first
    articulos = set()
    for k, s in list(paginas.items()):
        if k in ('', 'online-first') or k.startswith('issue/view/'):
            articulos |= {x for x in enlaces_revista(s) if re.fullmatch(r'article/view/\d+', x)}
    for k in sorted(articulos, key=lambda x: int(x.rsplit('/', 1)[1])):
        s = bajar(BASE + J + '/' + k)
        if s:
            paginas[k] = s
    return paginas


# ---------- 2. reescritura ----------
ASSETS = set()


def email_cf(hexs):
    try:
        key = int(hexs[:2], 16)
        return ''.join(chr(int(hexs[i:i + 2], 16) ^ key) for i in range(2, len(hexs), 2))
    except ValueError:
        return ''


def reescribir_url(u, copiadas, en_form=False):
    raw = html.unescape(u).strip()
    if not raw or raw.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'data:', '//')):
        return u.strip()
    m = re.match(r'https?://(?:www\.)?estudiospublicos\.cl(.*)$', raw)
    if m:
        path = m.group(1) or '/'
    elif raw.startswith('/'):
        path = raw
    else:
        return u.strip()
    sp = urlsplit(path)
    p, q, frag = sp.path, sp.query, sp.fragment
    if p.startswith('/cdn-cgi/l/email-protection'):
        e = email_cf(frag)
        return 'mailto:' + e if e else '#'
    if p.startswith(J) and (p == J or p[len(J)] == '/'):
        k = clave(p[len(J):])
        if k in copiadas and not q and not en_form:
            return ruta_local(k) + ('#' + frag if frag else '')
        return html.escape(BASE + path, quote=True)
    if p.startswith('/plugins/themes/ceptheme/'):
        ASSETS.add(p)
        return PREFIX + p
    if p == '/' and not q:
        return PREFIX + '/' + ('#' + frag if frag else '')
    return html.escape(BASE + path, quote=True)


QUITAR_SCRIPT = [
    'googletagmanager.com', "gtag('config'", 'fbq(', 'clarity.ms', '__CF$cv$params',
    'rocket-loader', 'email-decode', 'connect.facebook.net',
]


def js_local(s):
    s = re.sub(r'https://hooks\.zapier\.com/hooks/catch/[^\'"\s]+', DESACTIVADO, s)
    s = s.replace("'/index.php/cep/audioVisuals/getAsync?page='+page+'&type=video'",
                  "'" + PREFIX + "/ep-datos/audiovisuales/video-'+page+'.json'")
    s = s.replace("'/index.php/cep/audioVisuals/getAsync?page='+page+'&type=podcast'",
                  "'" + PREFIX + "/ep-datos/audiovisuales/podcast-'+page+'.json'")
    s = s.replace("'/index.php/cep/audioVisuals/view/", "'" + BASE + "/index.php/cep/audioVisuals/view/")
    for m in re.findall(r'(?:https://estudiospublicos\.cl)?(/plugins/themes/ceptheme/[^\'"\s)>?]+)', s):
        ASSETS.add(m)
    s = s.replace(BASE + '/plugins/themes/ceptheme/', PREFIX + '/plugins/themes/ceptheme/')
    s = re.sub(r'(?<![\w/.])/plugins/themes/ceptheme/', PREFIX + '/plugins/themes/ceptheme/', s)
    return s


def reescribir_html(s, copiadas):
    # scripts: fuera analítica y Cloudflare; Rocket Loader devuelve los type originales
    def script(m):
        abre, cuerpo = m.group(1), m.group(2)
        if any(x in abre or x in cuerpo for x in QUITAR_SCRIPT):
            return ''
        abre = re.sub(r'\stype="[0-9a-f]+-text/javascript"', '', abre)
        abre = re.sub(r'\sdata-cf-settings="[^"]*"', '', abre)
        return abre + js_local(cuerpo) + '</script>'
    s = re.sub(r'(<script\b[^>]*>)(.*?)</script>', script, s, flags=re.S | re.I)
    s = re.sub(r'<noscript>\s*<img[^>]*facebook\.com/tr[^>]*>\s*</noscript>', '', s, flags=re.I)
    s = s.replace('if (!window.__cfRLUnblockHandlers) return false; ', '')
    # correos protegidos por Cloudflare
    s = re.sub(r'<(a|span)\b[^>]*data-cfemail="([0-9a-f]+)"[^>]*>.*?</\1>',
               lambda m: html.escape(email_cf(m.group(2))), s, flags=re.S)
    # atributos con URL

    def attr(m):
        nombre, comilla, valor = m.group(1), m.group(2), m.group(3)
        return ' %s=%s%s%s' % (nombre, comilla, reescribir_url(valor, copiadas, nombre.lower() == 'action'), comilla)
    s = re.sub(r'\s(href|src|action|data-src|data-href|poster)\s*=\s*(["\'])(.*?)\2', attr, s, flags=re.I | re.S)
    s = re.sub(r'url\((["\']?)(https://estudiospublicos\.cl)?(/plugins/themes/ceptheme/[^)"\']+)\1\)',
               lambda m: (ASSETS.add(m.group(3)), 'url(%s%s%s)' % (m.group(1), PREFIX + m.group(3), m.group(1)))[1], s)
    # estilos en línea con rutas desde la raíz (logos de /public/...): al sitio real
    s = re.sub(r'url\((["\']?)(/(?!/|ep-prueba/)[^)"\']+)\1\)', lambda m: 'url(%s%s%s)' % (m.group(1), BASE + m.group(2), m.group(1)), s)
    # marca de copia de prueba y capa de cambios
    cabeza = ('<meta name="robots" content="noindex, nofollow">\n'
              '<script>window.dataLayer=[];function gtag(){}function fbq(){}</script>\n'
              # estilo CEP por defecto; ?estilo=actual muestra el diseño de hoy (se recuerda en el navegador)
              '<script>(function(){var e="cep";try{var m=location.search.match(/[?&]estilo=(cep|actual)/);'
              'if(m){e=m[1];localStorage.setItem("ep-estilo",e)}else{e=localStorage.getItem("ep-estilo")||"cep"}}catch(x){}'
              'if(e==="cep")document.documentElement.classList.add("ep-cep")})();</script>\n'
              '<link rel="stylesheet" href="%s/ep-cambios/ep-cambios.css">\n' % PREFIX)
    s = re.sub(r'</head>', cabeza + '</head>', s, count=1, flags=re.I)
    pie = ('<script src="%s/ep-cambios/ep-cambios.js"></script>\n'
           '<div class="ep-aviso-prueba" style="position:fixed;left:12px;bottom:12px;z-index:9999;background:#1B1C1E;'
           'color:#fff;font:600 12px/1.3 sans-serif;padding:8px 14px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25)">'
           'Prueba de cambios · no es el sitio oficial · <a href="%s/index.php/cep" style="color:#F9B233">ir a estudiospublicos.cl</a></div>\n'
           % (PREFIX, BASE))
    i = s.lower().rfind('</body>')
    s = s[:i] + pie + s[i:] if i >= 0 else s + pie
    return s


def escribir(rel, data):
    f = os.path.join(OUT, unquote(rel).lstrip('/'))
    os.makedirs(os.path.dirname(f), exist_ok=True)
    with open(f, 'wb') as fh:
        fh.write(data if isinstance(data, bytes) else data.encode('utf-8'))


# ---------- 3. tema ----------
def copiar_tema():
    hechos = set()
    while ASSETS - hechos:
        p = sorted(ASSETS - hechos)[0]
        hechos.add(p)
        data = bajar(BASE + p, binario=True)
        if data is None:
            continue
        if p.endswith('.css'):
            css = data.decode('utf-8', 'replace')
            for ref in re.findall(r'url\(\s*["\']?([^)"\']+)["\']?\s*\)', css):
                if ref.startswith(('data:', '#')):
                    continue
                absu = urljoin(BASE + p, ref)
                absu = re.sub(r'^https?://(?:www\.)?estudiospublicos\.cl', BASE, absu)
                if absu.startswith(BASE + '/'):
                    ASSETS.add(urlsplit(absu).path)
            # todo lo del mismo dominio queda local (las máscaras CSS no cargan desde otro origen)
            css = re.sub(r'https?://(?:www\.)?estudiospublicos\.cl/', PREFIX + '/', css)
            css = re.sub(r'url\((["\']?)/plugins/', r'url(\1' + PREFIX + '/plugins/', css)
            data = css.encode('utf-8')
        elif p.endswith('.js'):
            data = js_local(data.decode('utf-8', 'replace')).encode('utf-8')
        escribir(p, data)
    return len(hechos)


def main():
    paginas = descubrir()
    copiadas = set(paginas)
    print('páginas:', len(paginas))
    for k, s in paginas.items():
        escribir(ruta_local(k)[len(PREFIX):] + 'index.html', reescribir_html(s, copiadas))
    print('archivos del tema:', copiar_tema())
    for t in ('video', 'podcast'):
        escribir('/ep-datos/audiovisuales/%s-1.json' % t, '[]')
    escribir('/ep-datos/desactivado.json', '{"desactivado": "copia de prueba"}')
    with open(os.path.join(AQUI, 'paginas.json'), 'w', encoding='utf-8') as fh:
        json.dump(sorted(copiadas), fh, ensure_ascii=False, indent=0)


if __name__ == '__main__':
    main()
