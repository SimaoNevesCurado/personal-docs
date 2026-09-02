# Eloquent

Eloquent is Laravel's ORM. It lets you query and update database records through models instead of writing raw SQL for every operation.

I prefer using Eloquent models, relationships and query scopes before reaching for raw queries. Most of the time, they make the intent clearer and keep the code close to Laravel conventions.

## Basic Queries

Start queries with `Model::query()` when building a chain.

```php
Post::query()
    ->where('is_featured', true)
    ->latest()
    ->get();
```

This makes the query explicit and easy to extend.

Use `first()` when you expect one model or `null`:

```php
$post = Post::query()
    ->where('slug', $slug)
    ->first();
```

Use `firstOrFail()` when not finding the model should return a `404`:

```php
$post = Post::query()
    ->where('slug', $slug)
    ->firstOrFail();
```

## Selecting Columns

Select only the columns you need when returning lists.

```php
Post::query()
    ->select('id', 'title', 'slug', 'published_at')
    ->latest('published_at')
    ->get();
```

This keeps the query and response smaller, especially for tables with large text fields or JSON columns.

## Relationships

Use relationships instead of manually joining data in application code.

::: code-group

```php [Post.php]
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

```php [Query]
Post::query()
    ->with('user')
    ->latest()
    ->get();
```

:::

The relationship name should read naturally in the query. A post belongs to a user, and a post has many comments.

## Eager Loading

Use `with()` when you know the view or API response will need related data.

```php
Post::query()
    ->with(['user', 'comments'])
    ->latest()
    ->get();
```

This helps avoid N+1 queries.

You can also limit relationship columns:

```php
Post::query()
    ->with('user:id,name')
    ->select('id', 'user_id', 'title', 'slug')
    ->latest()
    ->get();
```

When limiting columns, remember to include the foreign key. In this example, `user_id` is needed so Eloquent can match each post to its user.

## Filtering By Relationships

Use `whereHas()` when the query depends on a relationship.

```php
Post::query()
    ->whereHas('comments', function ($query): void {
        $query->where('is_approved', true);
    })
    ->latest()
    ->get();
```

Use `withWhereHas()` when you want to filter by a relationship and eager load the same filtered relationship.

```php
Post::query()
    ->withWhereHas('comments', function ($query): void {
        $query->where('is_approved', true);
    })
    ->latest()
    ->get();
```

## Scopes

Use scopes when a query condition represents a reusable rule.

::: code-group

```php [Post.php]
use Illuminate\Database\Eloquent\Builder;

public function scopePublished(Builder $query): void
{
    $query->whereNotNull('published_at');
}
```

```php [Query]
Post::query()
    ->published()
    ->latest('published_at')
    ->get();
```

:::

Scopes are useful when they make the query read like the domain. Avoid creating a scope for every tiny condition if it is only used once.

## Conditional Queries

Use `when()` when a filter is optional.

```php
Post::query()
    ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
        $query->where('title', 'like', '%' . $request->string('search') . '%');
    })
    ->latest()
    ->paginate();
```

This avoids large `if` blocks around query code.

## Pagination

Use pagination for lists that can grow.

```php
$posts = Post::query()
    ->select('id', 'title', 'slug', 'published_at')
    ->latest('published_at')
    ->paginate(15);
```

With Inertia, return the paginated result as a prop:

```php
return Inertia::render('posts/index', [
    'posts' => $posts,
]);
```

## Creating Records

Use validated data from a Form Request when creating records.

```php
$post = Post::query()->create($request->validated());
```

The model should define its mass assignable fields with `#[Fillable]` or `$fillable`, depending on the project convention.

## Updating Records

For simple updates, update the model directly.

```php
$post->update($request->validated());
```

If the update has multiple steps, side effects, file uploads or notifications, I move that flow to an Action.

## Deleting Records

For simple deletes, call `delete()` on the model.

```php
$post->delete();
```

When deleting needs extra work, like removing uploaded files or detaching related records, I prefer putting that in an Action.

## Transactions

Use a transaction when multiple database changes should succeed or fail together.

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () use ($data): void {
    $post = Post::query()->create($data);

    $post->tags()->attach($data['tag_ids']);
});
```

If the post is created but the tags fail, the whole transaction rolls back.

## Query Debugging

Use `toSql()` when you want to inspect the generated SQL.

```php
$sql = Post::query()
    ->where('is_featured', true)
    ->toSql();
```

Use `dd()` carefully while debugging locally:

```php
Post::query()
    ->where('is_featured', true)
    ->dd();
```

Do not leave query debugging helpers in committed code.

## Notes

- Prefer `Model::query()` for readable query chains.
- Use relationships before manually stitching data together.
- Use eager loading to avoid N+1 queries.
- Prefer scopes when the query represents a reusable rule.
- Keep large workflows in Actions instead of hiding them inside query chains.
