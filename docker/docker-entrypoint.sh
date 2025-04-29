#!/bin/sh

# Start PHP-FPM
php-fpm -D

# Start Nginx (and keep container running)
nginx -g 'daemon off;'