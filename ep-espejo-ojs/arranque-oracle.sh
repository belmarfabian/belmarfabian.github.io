#!/bin/bash
# Script de inicio para Oracle Cloud (pegar en "Script de inicialización" al crear la instancia).
# Antes de pegarlo, reemplaza CAMBIAME por la clave que quieras para el usuario admin del OJS.
export ADMIN_CLAVE='CAMBIAME'
B=https://raw.githubusercontent.com/belmarfabian/belmarfabian.github.io/main/ep-espejo-ojs
mkdir -p /opt/espejo && cd /opt/espejo
for f in Dockerfile docker-compose.yml redirecciones.conf instalar-oracle.sh descargar.py manifiesto.json ojs-3.5.0-5.sql.gz; do
  curl -sfL --retry 5 -o "$f" "$B/$f"
done
bash instalar-oracle.sh > /var/log/espejo-instalacion.log 2>&1
