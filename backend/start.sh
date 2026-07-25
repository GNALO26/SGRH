#!/bin/bash
cd /var/www/html
php artisan migrate --seed --force
apache2-foreground
