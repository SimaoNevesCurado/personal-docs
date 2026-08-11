# VitePress Code Groups

Native VitePress syntax for code snippets with tabs and syntax highlighting.

## Basic Example

````md
::: code-group

```php [Laravel]
Route::get('/users', [UserController::class, 'index']);
```

```vue [Vue]
<script setup>
import { useForm } from '@inertiajs/vue3'
</script>
```

```ts [TypeScript]
type User = {
  id: number
  name: string
}
```

:::
````

## Rendered Example

::: code-group

```php [Laravel]
Route::get('/users', [UserController::class, 'index']);
```

```vue [Vue]
<script setup>
import { useForm } from '@inertiajs/vue3'
</script>
```

```ts [TypeScript]
type User = {
  id: number
  name: string
}
```

:::

## Notes

- Use `::: code-group` to start the tab group.
- Use the language after the triple backticks for syntax highlight.
- Use `[Label]` after the language to set the tab name.
- Close the group with `:::`.
