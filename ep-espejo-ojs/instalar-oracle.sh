#!/bin/bash
# Instala el espejo de Estudios Públicos (OJS 3.5.0-5) en una máquina Ubuntu 24.04 de Oracle Cloud.
# Uso (en el servidor, dentro de esta carpeta): sudo bash instalar-oracle.sh
# Requiere en la misma carpeta: ojs-3.5.0-5.sql.gz, manifiesto.json y descargar.py
set -euo pipefail
cd "$(dirname "$0")"
[ -f ojs-3.5.0-5.sql.gz ] && [ -f manifiesto.json ] || { echo "Faltan los archivos del espejo"; exit 1; }

# 1. Docker
if ! command -v docker >/dev/null; then
  apt-get update && apt-get install -y docker.io docker-compose-v2
fi
# Abrir el puerto 80 en el firewall interno de la imagen de Oracle
iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT 2>/dev/null || iptables -I INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
command -v netfilter-persistent >/dev/null && netfilter-persistent save || true

# 2. Código de OJS 3.5.0-5
[ -d ojs ] || { curl -sL https://pkp.sfu.ca/ojs/download/ojs-3.5.0-5.tar.gz | tar xz && mv ojs-3.5.0-5 ojs; }

# 3. Archivos: PDF y portadas desde el sitio público, con verificación de huella
mkdir -p files/usageStats/usageEventLogs files/usageStats/archive files/usageStats/processing files/usageStats/stage files/usageStats/reject
python3 descargar.py
cp -a public/. ojs/public/ && rm -rf public
chown -R 33:33 files ojs/public ojs/cache

# 4. Claves y configuración
[ -f .env ] || printf "BD_CLAVE=%s\nBD_CLAVE_ROOT=%s\n" "$(openssl rand -hex 16)" "$(openssl rand -hex 16)" > .env
. ./.env
IP=$(curl -s https://ifconfig.me || hostname -I | awk '{print $1}')
cp ojs/config.TEMPLATE.inc.php ojs/config.inc.php
python3 - "$IP" "$BD_CLAVE" <<'PY'
import re, sys, secrets, base64
ip, clave = sys.argv[1], sys.argv[2]
p = 'ojs/config.inc.php'; s = open(p).read()
for k, v in [('installed', 'On'), ('base_url', '"http://%s"' % ip), ('host', 'bd'), ('password', clave),
             ('files_dir', '/var/www/files'), ('locale', 'es'), ('enable_beacon', 'Off'),
             ('time_zone', '"America/Santiago"'), ('app_key', '"base64:%s"' % base64.b64encode(secrets.token_bytes(32)).decode())]:
    s = re.sub(r'(?m)^%s =.*$' % k, '%s = %s' % (k, v), s, count=1)
open(p, 'w').write(s)
PY
chown 33:33 ojs/config.inc.php

# 5. Levantar y cargar la base
docker compose up -d --build
until docker compose exec -T bd mariadb -uojs -p"$BD_CLAVE" ojs -e "select 1" >/dev/null 2>&1; do sleep 3; done
if [ "$(docker compose exec -T bd mariadb -uojs -p"$BD_CLAVE" ojs -N -e 'show tables' | wc -l)" = 0 ]; then
  zcat ojs-3.5.0-5.sql.gz | docker compose exec -T bd mariadb -uojs -p"$BD_CLAVE" ojs
fi
# 6. Clave nueva para el usuario admin (solo se muestra aquí, en la consola del servidor)
CLAVE_ADMIN=${ADMIN_CLAVE:-$(openssl rand -base64 12 | tr -d '/+=')}
HASH=$(docker compose exec -T web php -r 'echo password_hash($argv[1], PASSWORD_BCRYPT);' "$CLAVE_ADMIN")
docker compose exec -T bd mariadb -uojs -p"$BD_CLAVE" ojs -e "update users set password='$HASH' where username='admin'"
echo "Listo: abre http://$IP/index.php/cep"
[ -n "${ADMIN_CLAVE:-}" ] || echo "Usuario: admin  Clave: $CLAVE_ADMIN  (cámbiala al entrar)"
