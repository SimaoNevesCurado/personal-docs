# Pages e Props

## Controller

```php
use Inertia\Inertia;

return Inertia::render('Users/Index', [
    'users' => $users,
]);
```

## Page Vue

```vue
<script setup>
defineProps({
  users: Array,
})
</script>
```

## Notas

- Enviar apenas dados necessários para a page.
- Usar partial reloads quando a page tem filtros ou zonas independentes.
