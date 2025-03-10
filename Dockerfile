FROM php:8.2-fpm-alpine

# Install nginx and required tools
RUN apk add --no-cache nginx

# Configure nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Create directories
RUN mkdir -p /run/php /var/www/html /usr/local/bin

# Configure PHP-FPM
RUN echo "listen = /run/php/php-fpm.sock" >> /usr/local/etc/php-fpm.d/zz-docker.conf && \
    echo "listen.mode = 0666" >> /usr/local/etc/php-fpm.d/zz-docker.conf && \
    echo "error_reporting = E_ALL" > /usr/local/etc/php/conf.d/error_reporting.ini

# Set permissions
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

WORKDIR /var/www/html

EXPOSE 80

# Start both services
COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
CMD ["/usr/local/bin/docker-entrypoint.sh"]
