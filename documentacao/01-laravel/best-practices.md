# Laravel Best Practices

My approach to Laravel best practices can be a bit opinionated, but I believe it helps maintain a clean and maintainable codebase.
<br><br>
There is no one-size-fits-all approach, and I believe best practices should be tailored to the specific needs of each project.
However, I do believe there are some general best practices that can be followed across projects.

## PHP Style

For PHP files, I prefer using strict types at the top of the file:

```php
<?php

declare(strict_types=1);
```

I like explicit type declarations for method parameters and return types. It makes the code easier to understand and also helps tools like PHPStan or Larastan catch mistakes earlier.

```php
public function handle(Post $post, array $data): Post
{
    $post->update($data);

    return $post;
}
```

I also prefer classes to be `final` and `readonly` by default. This fits well for Actions, DTOs, services and other small application classes.

```php
final readonly class CreatePostData
{
    public function __construct(
        public string $title,
        public string $content,
    ) {
    }
}
```

##  Controllers

I'm a huge advocate of the `Action pattern`, so my controllers are thin and use actions to handle requests along with Form Requests.

For authorization, `I don't use policies or gates`. My approach is to use the `authorize method on the Form Request` for specific authorization logic and middleware for larger scoped authorization.

This approach is `not better or worse` than using policies or gates. However, since I already use Form Requests for validation, I prefer to keep the authorization logic in the Form Request, so I don't have to create more files to handle authorization. (Usually, people who use gates leave the authorize method returning `true` by default.)

<br>

::: code-group

```php [Controller]
public function update(UpdatePostRequest $request, Post $post, UpdatePostAction $updatePost)
{
    $post = $updatePost->handle($post, $request->validated());

    return redirect()->route('posts.show', $post);
}
```

```php [Form Request]
public function authorize(): bool
{
    return $this->route('post')->belongsToUser($this->user());
}

public function rules(): array
{
    return [
        'title' => ['required', 'string', 'max:255'],
        'content' => ['required', 'string'],
    ];
}
```

```php [Model]
public function belongsToUser(User $user): bool
{
    return $this->user_id === $user->id;
}
```

```php [Action]
public function handle(Post $post, array $data): Post
{
    $post->update($data);

    return $post;
}
```
:::
<br>

If the Form Request has a large payload, I prefer to use a DTO (Data Transfer Object) to return an object with the validated data.

I don't use DTOs for every Form Request because, as the codebase grows, you might have to handle a lot of DTOs, and it can become a bit cumbersome.

## Models

When creating new models, I like to also create useful factories and seeders when they are relevant. If the model is going to be used in tests or local development, having a factory from the beginning usually pays off quickly.

For casts, I prefer the `casts()` method when using newer Laravel versions, unless the existing project convention uses the `$casts` property.

```php
protected function casts(): array
{
    return [
        'published_at' => 'datetime',
        'is_featured' => 'boolean',
    ];
}
```

## Eloquent and Database

I prefer to use Eloquent models and relationships before reaching for raw queries. Most of the time, the relationship methods make the intent clearer and keep the code closer to Laravel's conventions.

When writing relationships, I prefer to add explicit return types:

```php
public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}
```

I avoid using `DB::` directly unless the query is complex enough that Eloquent would make it harder to read. For normal queries, I prefer `Model::query()`:

```php
$posts = Post::query()
    ->with('user')
    ->latest()
    ->get();
```

I also try to think about N+1 problems early. If a page needs related data, I prefer eager loading it explicitly instead of letting the view or resource trigger extra queries later.

## Queues

For time-consuming work, I prefer queued jobs instead of doing everything inside the request cycle. If something sends emails, imports data, talks to external services or does heavy processing, it usually belongs in a job that implements `ShouldQueue`.

::: code-group

```php [Controller]
public function store(StorePostImportRequest $request): RedirectResponse
{
    $import = PostImport::query()->create($request->validated());

    ProcessPostImport::dispatch($import);

    return to_route('post-imports.show', $import);
}
```

```php [Job]
final class ProcessPostImport implements ShouldQueue
{
    use Queueable;

    public function __construct(public PostImport $import)
    {
    }

    public function handle(ProcessPostImportAction $processPostImport): void
    {
        $processPostImport->handle($this->import);
    }
}
```

```php [Action]
final class ProcessPostImportAction
{
    public function handle(PostImport $import): void
    {
        $import->posts()->each(function (ImportedPost $importedPost): void {
            Post::query()->create([
                'title' => $importedPost->title,
                'content' => $importedPost->content,
                'user_id' => $importedPost->user_id,
            ]);
        });

        $import->update([
            'processed_at' => now(),
        ]);
    }
}
```

:::

In this case, the job is only responsible for queueing and executing the work. The actual business logic still lives in an Action, so it can be reused from other places if needed.

## Routes and URLs

I prefer named routes and helpers when generating URLs. This makes links easier to refactor because the URL structure can change without updating every place that links to it.

```php
return redirect()->route('posts.show', $post);
```

I also like using `to_route()` for redirects because it is shorter and reads nicely inside controllers and actions:

```php
return to_route('posts.show', $post);
```


## Configuration

I avoid using `env()` outside configuration files. Application code should read from `config()` instead, so values behave correctly when the config is cached.

```php
config('app.name')
```

## Testing

I prefer Pest for tests, and most application behavior should be covered with feature tests. Unit tests are useful for isolated logic, but for Laravel applications, feature tests usually give more confidence.

When testing models, I prefer using factories instead of manually creating all the data every time. I also check if a factory already has useful states before adding custom setup in the test.

For response assertions, I prefer specific assertions instead of raw status codes:

```php
$response->assertForbidden();
$response->assertNotFound();
$response->assertSuccessful();
```

When testing validation rules with many similar cases, I like using Pest datasets to avoid repeating the same test structure over and over.

## Tools

I like using tools that enforce quality automatically instead of relying only on code review.

For formatting, I use Laravel Pint:

```bash
vendor/bin/pint --dirty
```

For safe automated refactors and framework upgrades, I like Rector. It is useful when modernizing syntax or applying project-wide changes without doing everything manually.

```bash
vendor/bin/rector process --dry-run
```

For static analysis, I like PHPStan or Larastan. It helps catch type issues and mistakes that tests might not cover.

```bash
vendor/bin/phpstan analyse
```

For local debugging, I like Laravel Telescope or Debugbar depending on the project. Telescope is great for inspecting requests, jobs, queries, notifications and exceptions. Debugbar is lighter and useful when I just need quick feedback while developing.


## APIs

For APIs, I prefer using Eloquent API Resources instead of returning models directly. It gives more control over the response shape and avoids leaking internal model structure.

```php
return PostResource::collection($posts);
```


If the API is expected to evolve, I also prefer versioning it early instead of waiting until breaking changes are harder to manage.
