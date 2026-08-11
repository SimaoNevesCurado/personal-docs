# Deploy

## Before Deploy

- Confirm production `.env`.
- Run tests.
- Build assets.
- Check pending migrations.

## Typical Commands

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan optimize
```
