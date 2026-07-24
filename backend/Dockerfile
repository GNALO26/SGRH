FROM php:8.2-apache

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    git \
    unzip \
    zlib1g-dev \
    libzip-dev \
    libpq-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_pgsql pdo_mysql zip gd mbstring exif pcntl bcmath

RUN a2enmod rewrite

WORKDIR /var/www/html

# Copier uniquement le code source (sans vendor)
COPY . .

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Créer les dossiers de cache Laravel
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache

# Installer les dépendances depuis zéro (composer.lock est présent)
RUN composer install --no-interaction --prefer-dist --no-dev --no-scripts --no-autoloader

# Régénérer l'autoloader
RUN composer dump-autoload

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

COPY docker/000-default.conf /etc/apache2/sites-available/000-default.conf

EXPOSE 80

CMD ["apache2-foreground"]
