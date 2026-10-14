# Models

Models should describe the domain clearly through relationships, casts, scopes, and small helper methods when they make the code easier to read.

I prefer keeping models expressive, but not overloaded. A model should explain what the record is and how it relates to the rest of the application. Large business flows should usually live in Actions instead.

## Basic Shape

This is the usual structure I like for a model.

```php [Post.php]
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[UseFactory(PostFactory::class)]
#[Appends(['excerpt'])]
#[Fillable(['user_id', 'title', 'slug', 'content', 'published_at', 'is_featured'])]
final class Post extends Model
{
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'user_id' => 'integer',
            'published_at' => 'datetime',
            'is_featured' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function scopePublished(Builder $query): void
    {
        $query->whereNotNull('published_at');
    }

    protected function title(): Attribute
    {
        return Attribute::make(
            get: fn (string $value): string => str($value)->title()->toString(),
        );
    }

    protected function excerpt(): Attribute
    {
        return Attribute::make(
            get: fn (): string => str($this->content)->limit(120)->toString(),
        );
    }

    public function belongsToUser(User $user): bool
    {
        return $this->user_id === $user->id;
    }
}
```

## Model Attributes

On newer Laravel versions, I like using PHP attributes on models when they make the model cleaner.

Instead of defining `$fillable`, `$appends`, factory traits or other configuration inside the class body, the model can declare that metadata above the class.

```php
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;

#[UseFactory(PostFactory::class)]
#[Appends(['excerpt'])]
#[Fillable(['title', 'slug', 'content'])]
final class Post extends Model
{
    // ...
}
```

This keeps the model configuration visible immediately when opening the file.

`#[Fillable]` defines which fields can be mass assigned. This makes `create()` and `update()` safer because Laravel only accepts the fields listed there.

```php
Post::query()->create($request->validated());
```

`#[Appends]` exposes calculated attributes when the model is converted to an array or JSON. This is useful for values that the frontend commonly needs but that do not exist as columns in the database.

`#[UseFactory]` connects the model to its factory and replaces the older pattern of adding `use HasFactory;` inside the model.

Laravel also has other model attributes, like `#[ObservedBy]` and `#[ScopedBy]`, that can be useful depending on the project.

```php
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;

#[ObservedBy([PostObserver::class])]
#[ScopedBy([PublishedScope::class])]
final class Post extends Model
{
    // ...
}
```

I prefer being explicit with `#[Fillable]` instead of leaving the model open to every field. I also avoid appending everything by default because appended attributes are included in responses and can make payloads heavier.

I only use model attributes when they make the behavior easier to discover. If an attribute hides too much behavior, I prefer being more explicit in the code.

## Casts

Casts tell Laravel how a database value should be converted when reading or writing the model.

```php
protected function casts(): array
{
    return [
        'id' => 'integer',
        'published_at' => 'datetime',
        'is_featured' => 'boolean',
    ];
}
```

I prefer the `casts()` method on newer Laravel versions. If the project already uses the `$casts` property, follow the existing convention.

Common casts I use:

- `integer` for IDs and counters
- `boolean` for flags
- `datetime` for dates with time
- `date` for dates without time
- `array` for JSON columns
- `decimal:2` for monetary-like values when appropriate

## Relationships

Relationships should have explicit return types. This makes the model easier to understand and helps static analysis tools.

```php
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}

public function comments(): HasMany
{
    return $this->hasMany(Comment::class);
}
```

Then the relationship can be used in queries:

```php
Post::query()
    ->with('user')
    ->latest()
    ->get();
```

Use eager loading with `with()` when you know the relationship will be needed. This helps avoid N+1 query problems.

## Scopes

Use scopes when a query condition represents a reusable rule.

```php
use Illuminate\Database\Eloquent\Builder;

public function scopePublished(Builder $query): void
{
    $query->whereNotNull('published_at');
}
```

Then use it like this:

```php
Post::query()
    ->published()
    ->latest('published_at')
    ->get();
```

Scopes are useful when they make the query read like the domain. Avoid creating a scope for every tiny `where()` if it is only used once.

## Accessors, Attributes And Mutators

Accessors and mutators let the model transform values when they are read from or written to the model.

In newer Laravel versions, I prefer using the `Attribute` class instead of the older `getNameAttribute()` and `setNameAttribute()` methods.

## Accessors

An accessor changes how a value is returned from the model.

```php
use Illuminate\Database\Eloquent\Casts\Attribute;

protected function title(): Attribute
{
    return Attribute::make(
        get: fn (string $value): string => str($value)->title()->toString(),
    );
}
```

If the database stores this:

```md
my first post
```

The model returns this:

```md
My First Post
```

Use accessors for presentation-friendly values, derived values, or small transformations that make the model nicer to use.

## Mutators

A mutator changes how a value is stored on the model.

```php
use Illuminate\Database\Eloquent\Casts\Attribute;

protected function slug(): Attribute
{
    return Attribute::make(
        set: fn (string $value): string => str($value)->slug()->toString(),
    );
}
```

Now this assignment:

```php
$post->slug = 'My First Post';
```

Stores this value:

```md
my-first-post
```

Use mutators for small write-time normalization. If the transformation depends on other models, external services or a bigger workflow, move it to an Action.

## Accessor And Mutator Together

The same attribute can have both `get` and `set` behavior.

```php
use Illuminate\Database\Eloquent\Casts\Attribute;

protected function email(): Attribute
{
    return Attribute::make(
        get: fn (string $value): string => strtolower($value),
        set: fn (string $value): string => strtolower($value),
    );
}
```

This keeps the email normalized when it is saved and predictable when it is read.

## Appended Attributes

Sometimes you want to expose a calculated value when the model is converted to an array or JSON.

```php
protected $appends = [
    'image_url',
];
```

```php
protected function imageUrl(): Attribute
{
    return Attribute::make(
        get: fn (): ?string => $this->image_path
            ? Storage::disk('public')->url($this->image_path)
            : null,
    );
}
```

The database stores only the path:

```md
posts/example-image.jpg
```

But the frontend can receive a full public URL:

```md
/storage/posts/example-image.jpg
```

Only append values that are actually useful to the frontend or API response. Too many appended attributes can make responses heavier and can hide expensive logic.

## Helper Methods

Small helper methods can make authorization and condition checks more readable.

```php
public function belongsToUser(User $user): bool
{
    return $this->user_id === $user->id;
}
```

This can be used from a Form Request `authorize()` method:

```php
public function authorize(): bool
{
    return $this->route('post')->belongsToUser($this->user());
}
```

This keeps the condition easy to read without creating a Policy or Gate for simple request-level authorization.

## Factories

When a model is used in tests or local development, create a factory early.

```bash
php artisan make:model Post -mf
```

The `-m` flag creates a migration and the `-f` flag creates a factory.

A simple factory might look like this:

```php [PostFactory.php]
public function definition(): array
{
    return [
        'title' => fake()->sentence(),
        'slug' => fake()->slug(),
        'content' => fake()->paragraphs(3, true),
        'published_at' => fake()->optional()->dateTime(),
        'is_featured' => fake()->boolean(),
    ];
}
```

Factories make tests and seeders easier to write.

## Notes

Models should not become a dumping ground for every feature. I keep relationships, casts, scopes, accessors and small domain helpers in the model.

If the logic coordinates multiple models, sends notifications, dispatches jobs or has several steps, I usually move it to an Action.
