#!/bin/bash
set -e

# Appliquer les migrations
php artisan migrate --force

# Exécuter le seed uniquement si l'admin n'existe pas déjà (optionnel)
php artisan db:seed --force

# Lancer le serveur via l'entrypoint de l'image de base
exec /init