# About This Documentation

This is my personal documentation. I use it to keep learning, organize what I discover and avoid losing useful notes, commands and patterns.

Some things here may be incomplete, outdated or conceptually wrong. If you find something that can be improved, I would genuinely be happy if you contacted me and helped me progress.

I made this documentation public so I can access it whenever I need it, and also to help people get started. Sometimes official documentation is excellent but not very straight forward when you are still connecting the dots.

## Quick Entry Points

- [Laravel](/development/01-laravel/best-practices)
- [Vue](/development/02-vue/)
- [Inertia](/development/03-inertia/)



```

supply

```yaml

services:
  supplyhub-app:
    container_name: supplyhub
    image: 'registry.seeinformatica.pt/supplyhub/app:production'
    restart: unless-stopped

    environment:
      APP_ENV: production
      APP_DEBUG: 'false'
      APP_KEY: '${APP_KEY}'
      APP_URL: '${APP_URL}'

      DB_CONNECTION: sqlite
      DB_DATABASE: /app/storage/database/database.sqlite

      SESSION_DRIVER: file
      CACHE_STORE: file
      QUEUE_CONNECTION: database

    volumes:
      - 'storage-data:/app/storage'

    networks:
      - default
      - coolify
      - proxy

  supplyhub-worker:
    container_name: supplyhub-worker
    image: 'registry.seeinformatica.pt/supplyhub/app:production'
    restart: unless-stopped
    working_dir: /app

    entrypoint:
      - php

    command:
      - artisan
      - 'queue:work'
      - '--queue=default'
      - '--sleep=3'
      - '--tries=3'
      - '--timeout=90'
      - '--no-interaction'

    environment:
      APP_ENV: production
      APP_DEBUG: 'false'
      APP_KEY: '${APP_KEY}'
      APP_URL: '${APP_URL}'

      DB_CONNECTION: sqlite
      DB_DATABASE: /app/storage/database/database.sqlite

      SESSION_DRIVER: file
      CACHE_STORE: file
      QUEUE_CONNECTION: database

    volumes:
      - 'storage-data:/app/storage'

    networks:
      - default

volumes:
  storage-data: null

networks:
  coolify:
    external: true

  proxy:
    external: true

```
