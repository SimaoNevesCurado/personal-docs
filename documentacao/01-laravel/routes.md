# Routes

Routes should be simple and readable. They define how an HTTP request enters the application and which controller method should handle it.

I prefer keeping routes boring. A route should usually point to a controller, have a clear name, and avoid inline business logic.

Routes live in the `routes` directory. The most common files are:

- `routes/web.php` for browser pages, Inertia pages and session-based requests
- `routes/api.php` for API endpoints
- `routes/console.php` for console commands

## Basic Route

This is the simplest shape of a Laravel route:

::: code-group

```php [Inline route]
<?php

declare(strict_types=1);

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->name('dashboard');
```

```php [Controller route]
<?php

declare(strict_types=1);

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', DashboardController::class)
    ->name('dashboard');
```

```php [DashboardController.php]
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

final readonly class DashboardController
{
    public function __invoke(): Response
    {
        return Inertia::render('dashboard');
    }
}
```

:::

Both examples respond to a `GET` request for `/dashboard` and render the `dashboard` Inertia page.

The inline route is fine for very small routes or quick pages. When the logic starts growing, move it to a controller.

The route name is important because the rest of the app can generate URLs without hardcoding paths:

```php
return to_route('dashboard');
```

## Controller Methods

When a controller has multiple actions, point each route to a specific method.

```php [routes/web.php]
use App\Http\Controllers\PostController;

Route::get('/posts', [PostController::class, 'index'])
    ->name('posts.index');

Route::get('/posts/create', [PostController::class, 'create'])
    ->name('posts.create');

Route::post('/posts', [PostController::class, 'store'])
    ->name('posts.store');

Route::get('/posts/{post}', [PostController::class, 'show'])
    ->name('posts.show');
```

This keeps the URL, HTTP method and controller method explicit.

## Resource Routes

For standard CRUD screens, I usually prefer resource routes.

```php [routes/web.php]
use App\Http\Controllers\PostController;

Route::resource('posts', PostController::class);
```

This creates the common REST routes:

| Method | URI | Controller | Route name |
| --- | --- | --- | --- |
| GET | `/posts` | `index` | `posts.index` |
| GET | `/posts/create` | `create` | `posts.create` |
| POST | `/posts` | `store` | `posts.store` |
| GET | `/posts/{post}` | `show` | `posts.show` |
| GET | `/posts/{post}/edit` | `edit` | `posts.edit` |
| PUT/PATCH | `/posts/{post}` | `update` | `posts.update` |
| DELETE | `/posts/{post}` | `destroy` | `posts.destroy` |

If you do not need all actions, limit the route list:

```php
Route::resource('posts', PostController::class)
    ->only(['index', 'show', 'store']);
```

Or exclude actions you do not want:

```php
Route::resource('posts', PostController::class)
    ->except(['destroy']);
```

## Route Model Binding

Laravel can automatically resolve route parameters into models.

```php [routes/web.php]
Route::get('/posts/{post}', [PostController::class, 'show'])
    ->name('posts.show');
```

```php [PostController.php]
public function show(Post $post): Response
{
    return Inertia::render('posts/show', [
        'post' => $post,
    ]);
}
```

Because the route parameter is `{post}` and the controller expects `Post $post`, Laravel queries the model automatically.

If no post exists, Laravel returns a `404` response.

## Middleware

Use middleware to protect groups of routes.

```php [routes/web.php]
Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('/dashboard', DashboardController::class)
        ->name('dashboard');

    Route::resource('posts', PostController::class);
});
```

This means every route inside the group requires an authenticated and verified user.

## Route Prefixes

Use prefixes when a group of routes belongs under the same URL segment.

```php [routes/web.php]
Route::middleware('auth')
    ->prefix('admin')
    ->name('admin.')
    ->group(function (): void {
        Route::get('/dashboard', AdminDashboardController::class)
            ->name('dashboard');

        Route::resource('users', AdminUserController::class);
    });
```

This creates routes like:

- `/admin/dashboard` with the name `admin.dashboard`
- `/admin/users` with the name `admin.users.index`

## Inertia Pages

With Inertia, routes usually return an Inertia response from a controller.

```php [routes/web.php]
Route::get('/settings/profile', [ProfileController::class, 'edit'])
    ->name('profile.edit');
```

```php [ProfileController.php]
public function edit(): Response
{
    return Inertia::render('settings/profile');
}
```

The route defines the URL. The controller decides which Inertia page should be rendered.

## Redirects

Use `to_route()` when redirecting to a named route.

```php
return to_route('posts.show', $post)
    ->with('success', 'Post created successfully.');
```

This is better than hardcoding a URL because the route path can change later without breaking redirects.

## Route List

When debugging routes, use:

```bash
php artisan route:list
```

For a smaller output, filter by name or path:

```bash
php artisan route:list --name=posts
php artisan route:list --path=posts
```

## Notes

Keep routes focused on HTTP mapping. If a route starts having conditionals, queries or business rules, that logic probably belongs in a controller, Form Request, Action, policy or service.

Good routes are easy to scan. You should be able to quickly understand the URL, HTTP method, controller and route name.
