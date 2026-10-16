"""Baja los PDF y portadas públicas desde estudiospublicos.cl a las rutas del espejo y verifica su huella."""
import json, os, hashlib, subprocess, sys, concurrent.futures as cf
man = json.load(open('manifiesto.json'))
def uno(m):
    if os.path.exists(m['ruta']) and hashlib.sha1(open(m['ruta'], 'rb').read()).hexdigest() == m['sha1']: return True
    os.makedirs(os.path.dirname(m['ruta']), exist_ok=True)
    for _ in range(4):
        subprocess.run(['curl', '-sfL', '--max-time', '300', '-o', m['ruta'], m['url']])
        if os.path.exists(m['ruta']) and hashlib.sha1(open(m['ruta'], 'rb').read()).hexdigest() == m['sha1']: return True
    return False
with cf.ThreadPoolExecutor(3) as ex: ok = list(ex.map(uno, man))
print('archivos bajados y verificados: %d de %d' % (sum(ok), len(ok)))
