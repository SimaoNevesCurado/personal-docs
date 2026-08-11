# Boas Práticas Laravel

## Controllers

- Controllers finos.
- Requests para validação.
- Policies para autorização.
- Services apenas quando existe regra reutilizável ou fluxo com vários passos.

## Validação

```bash
php artisan make:request StorePostRequest
```

::: code-group

```php [Form Request]
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'unique:users,email'],
    ];
}
```

```php [Controller]
public function store(StoreUserRequest $request)
{
    User::create($request->validated());

    return redirect()->route('users.index');
}
```

```php [Policy]
public function update(User $user, Post $post): bool
{
    return $user->id === $post->user_id;
}
```

:::

## Organização

- Manter nomes explícitos.
- Evitar abstrações antes de haver repetição real.
- Testar regras de negócio críticas.
