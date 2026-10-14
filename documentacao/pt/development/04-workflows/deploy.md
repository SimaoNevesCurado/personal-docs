# Deploy

## Antes do Deploy

- Confirmar `.env` de produção.
- Correr testes.
- Fazer build dos assets.
- Confirmar migrations pendentes.

## Comandos Típicos

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan optimize
```
