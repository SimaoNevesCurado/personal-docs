# Eloquent

## Relationships

Keep real examples of `hasMany`, `belongsTo`, `belongsToMany` and scopes used in your projects here.

## Query Patterns

```php
User::query()
    ->where('active', true)
    ->latest()
    ->paginate();
```

## Notes

- Prefer scopes when the query represents a reusable rule.
- Use eager loading to avoid N+1 queries.
