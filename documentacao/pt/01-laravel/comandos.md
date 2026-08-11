# Comandos Laravel

## Projeto

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

## Cache

```bash
php artisan optimize:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## Diagnóstico

```bash
php artisan about
php artisan route:list
php artisan queue:failed
```
