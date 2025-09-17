FROM httpd:2.4.62

RUN apt-get update && apt-get install -y \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*

COPY ./apache/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY ./apache/sites/cochatech-vhost.conf /usr/local/apache2/conf/extra/cochatech-vhost.conf

RUN mkdir -p /usr/local/apache2/logs \
    && mkdir -p /var/www/html/public \
    && chown -R www-data:www-data /var/www/html

EXPOSE 80
CMD ["httpd-foreground"]
