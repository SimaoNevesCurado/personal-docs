# Code Groups Nativos Do VitePress

Sintaxe nativa do VitePress para snippets com tabs e syntax highlight.

## Exemplo Base

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

## Exemplo Renderizado

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

## Notas

- Usa `::: code-group` para abrir o grupo de tabs.
- Usa a linguagem depois dos backticks para ter syntax highlight.
- Usa `[Nome]` depois da linguagem para definir o nome da tab.
- Fecha o grupo com `:::`.
