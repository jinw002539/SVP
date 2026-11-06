# syntax=docker/dockerfile:1
# Imagem de produção para Laravel + React (Inertia). Pensada para Render (e serve noutros sítios com Docker).

############################
# 1) Construir (PHP + Node)
############################
FROM serversideup/php:8.4-cli AS build
USER root

# Extensões de que o site precisa (imagens WebP e EXIF das fotos, textos em português)
RUN install-php-extensions gd exif intl

# Node 22 para o Vite (o plugin Wayfinder também precisa de PHP durante o build)
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# 1.º as dependências (melhor uso da cache do Docker)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY package.json package-lock.json ./
RUN npm ci

# Depois o código
COPY . .
RUN composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction

# Chave só para o build (a verdadeira vem das variáveis de ambiente em produção)
ENV APP_ENV=production APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
RUN npm run build && rm -rf node_modules

############################
# 2) Imagem final (nginx + PHP-FPM)
############################
FROM serversideup/php:8.4-fpm-nginx AS production
USER root
RUN install-php-extensions gd exif intl

ENV APP_ENV=production \
    PHP_OPCACHE_ENABLE=1 \
    AUTORUN_ENABLED=true \
    AUTORUN_LARAVEL_MIGRATION=true \
    SSL_MODE=off

WORKDIR /var/www/html
COPY --chown=www-data:www-data --from=build /var/www/html /var/www/html

# Pastas que o Laravel precisa de escrever
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache public/uploads \
    && chown -R www-data:www-data storage bootstrap/cache public/uploads

USER www-data
EXPOSE 8080
