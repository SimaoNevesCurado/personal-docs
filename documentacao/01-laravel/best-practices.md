# Laravel Best Practices

## Controllers

- Keep controllers thin.
- Use requests for validation.
- Use policies for authorization.
- Use services only when there is reusable logic or a flow with multiple steps.

## Validation

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

## Structure

- Keep names explicit.
- Avoid abstractions before there is real repetition.
- Test critical business rules.
