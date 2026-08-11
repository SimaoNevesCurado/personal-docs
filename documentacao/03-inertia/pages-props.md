# Pages and Props

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

## Notes

- Send only the data needed by the page.
- Use partial reloads when the page has filters or independent areas.
