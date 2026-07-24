FROM php:8.2-apache

# Définir le frontend non interactif
ENV DEBIAN_FRONTEND=noninteractive

# Mettre à jour la liste des paquets et installer les dépendances système
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

# Installer les extensions PHP nécessaires
RUN docker-php-ext-install pdo_pgsql pdo_mysql zip gd mbstring exif pcntl bcmath intl

# Activer le module rewrite Apache
RUN a2enmod rewrite

WORKDIR /var/www/html

# Copier le code source
COPY . .

# Installer Composer et les dépendances PHP
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Configuration Apache personnalisée
COPY docker/000-default.conf /etc/apache2/sites-available/000-default.conf

EXPOSE 80

CMD ["apache2-foreground"]