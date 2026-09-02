# Form Requests

Form Requests are where I prefer to keep validation and request-specific authorization. This keeps controllers smaller and places the request rules close to the request itself.

Instead of validating directly inside the controller, create a dedicated request class for the action.

## Create A Form Request

Use Artisan to generate a Form Request:

```bash
php artisan make:request StorePostRequest
```

Laravel creates the file in:

```md
app/Http/Requests/StorePostRequest.php
```

## Basic Shape

This is the usual structure of a Form Request.

```php [StorePostRequest.php]
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'published' => ['required', 'boolean'],
        ];
    }
}
```

The `authorize()` method decides if the user can make this request.

The `rules()` method defines which data is valid.

## Use It In A Controller

Type-hint the Form Request in the controller method. Laravel automatically validates the request before the method runs.

::: code-group

```php [Route]
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

Route::post('/posts', [PostController::class, 'store'])
    ->name('posts.store');
```

```php [Controller]
use App\Http\Requests\StorePostRequest;
use Illuminate\Http\RedirectResponse;

final readonly class PostController
{
    public function store(StorePostRequest $request): RedirectResponse
    {
        $post = Post::query()->create($request->validated());

        return to_route('posts.show', $post)
            ->with('success', 'Post created successfully.');
    }
}
```

:::

If validation fails, the controller method does not run. Laravel redirects back with validation errors.

## Validated Data

Use `validated()` when you want only the fields that passed validation.

```php
$data = $request->validated();
```

This is safer than using all request data because unexpected fields are ignored.

If you only need one validated field, use `safe()`:

```php
$title = $request->safe()->string('title');
```

## Authorization

For request-specific permissions, I prefer using the `authorize()` method on the Form Request instead of creating Gates or Policies.

This keeps the validation and authorization for that request in the same place. If the user is not allowed to make the request, the controller method never runs.

```php
public function authorize(): bool
{
    return $this->user()?->isAdmin() ?? false;
}
```

If this returns `false`, Laravel returns a `403` response before the controller method runs.

This is not better or worse than using Gates or Policies. It is just the approach I prefer because I already use Form Requests for validation, so I do not need extra files for simple request-level authorization.

For larger scoped authorization, like protecting a full admin area, I use middleware.

## Custom Messages

Use `messages()` when the default validation messages are not clear enough.

```php
public function messages(): array
{
    return [
        'title.required' => 'The post needs a title.',
        'published.boolean' => 'Published must be true or false.',
    ];
}
```

## Custom Attribute Names

Use `attributes()` when you want nicer field names in validation messages.

```php
public function attributes(): array
{
    return [
        'image_path' => 'image',
    ];
}
```

Instead of showing `image path`, Laravel can show `image`.

## Preparing Data

Use `prepareForValidation()` when the incoming value needs small normalization before validation.

```php
protected function prepareForValidation(): void
{
    $this->merge([
        'slug' => str($this->string('title'))->slug()->toString(),
    ]);
}
```

Keep this method small. If the transformation becomes business logic, move it to an Action or service.

## Boolean Inputs

HTML checkboxes only send a value when they are checked. A good pattern is to send a hidden default value before the checkbox.

```html
<input type="hidden" name="published" value="0">
<input type="checkbox" name="published" value="1">
```

This ensures that the server always receives a value for `published`: `0` when unchecked and `1` when checked.

This avoids additional normalization and simplifies validation on the server.

```php
'published' => ['required', 'boolean'],
```

## Notes

Use Form Requests when validation has a name and belongs to a specific action, like `StorePostRequest`, `UpdateProfileRequest` or `UploadAvatarRequest`.

For very small one-off validation, inline controller validation can be fine. But once the controller starts growing, move validation into a Form Request.
