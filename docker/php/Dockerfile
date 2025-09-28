FROM php:8.2-apache

# Instalar dependencias del sistema y extensiones de PHP
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql pgsql

# Habilitar mod_rewrite de Apache
RUN a2enmod rewrite

# Configurar Apache para que el DocumentRoot sea /public de Laravel
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/000-default.conf \
    && sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Crear configuración adicional para Laravel
RUN echo "<Directory /var/www/html/public>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>" > /etc/apache2/conf-available/laravel.conf \
    && a2enconf laravel

# Instalar Composer (traído de la imagen oficial de Composer)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Definir directorio de trabajo
WORKDIR /var/www/html
