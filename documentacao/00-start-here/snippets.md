# Snippets

Reusable code snippets with tabs for different frontend stacks.

## Validation Form

::: code-group

```vue [Vue]
<Form
  action="/users"
  method="post"
  #default="{ errors, invalid, valid, validate }"
>
  <input name="email" @change="validate('email')" />
  <p v-if="valid('email')">Valid email address</p>
  <p v-if="invalid('email')">{{ errors.email }}</p>
</Form>
```

```tsx [React]
<Form action="/users" method="post">
  {({ errors, invalid, valid, validate }) => (
    <>
      <input name="email" onChange={() => validate('email')} />
      {valid('email') && <p>Valid email address</p>}
      {invalid('email') && <p>{errors.email}</p>}
    </>
  )}
</Form>
```

```svelte [Svelte]
<Form action="/users" method="post" let:errors let:invalid let:valid let:validate>
  <input name="email" on:change={() => validate('email')} />
  {#if valid('email')}<p>Valid email address</p>{/if}
  {#if invalid('email')}<p>{errors.email}</p>{/if}
</Form>
```

:::

## Create User With Laravel + Inertia + Vue

::: code-group

```php [Routes]
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/users/create', [UserController::class, 'create'])
    ->name('users.create');

Route::post('/users', [UserController::class, 'store'])
    ->name('users.store');
```

```php [Controller]
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

public function create()
{
    return Inertia::render('Users/Create');
}

public function store(Request $request)
{
    $data = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'unique:users,email'],
    ]);

    User::create($data);

    return redirect()->route('users.index');
}
```

```vue [Vue Page]
<script setup>
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  name: '',
  email: '',
})

const submit = () => form.post('/users')
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="form.name" type="text" name="name" />
    <p v-if="form.errors.name">{{ form.errors.name }}</p>

    <input v-model="form.email" type="email" name="email" />
    <p v-if="form.errors.email">{{ form.errors.email }}</p>

    <button type="submit" :disabled="form.processing">
      Create user
    </button>
  </form>
</template>
```

:::

## How to Add More

Use the native VitePress syntax:

````md
::: code-group

```php [Laravel]
// Code here
```

```vue [Vue]
<!-- Code here -->
```

:::
````
