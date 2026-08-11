# Eloquent

## Relações

Guarda aqui exemplos reais de `hasMany`, `belongsTo`, `belongsToMany` e scopes usados nos teus projetos.

## Query Patterns

```php
User::query()
    ->where('active', true)
    ->latest()
    ->paginate();
```

## Notas

- Preferir scopes quando a query representa uma regra reutilizável.
- Usar eager loading para evitar N+1.
