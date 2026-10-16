FROM php:8.2-apache
RUN apt-get update && apt-get install -y --no-install-recommends libpng-dev libjpeg-dev libfreetype6-dev libzip-dev libicu-dev libxml2-dev libxslt1-dev unzip mariadb-client \
 && docker-php-ext-configure gd --with-jpeg --with-freetype \
 && docker-php-ext-install mysqli pdo_mysql gd zip intl xsl bcmath ftp \
 && a2enmod rewrite && rm -rf /var/lib/apt/lists/*
RUN printf "memory_limit=2048M\nupload_max_filesize=200M\npost_max_size=200M\nmax_execution_time=0\n" > /usr/local/etc/php/conf.d/ojs.ini
COPY redirecciones.conf /etc/apache2/conf-enabled/redirecciones.conf
