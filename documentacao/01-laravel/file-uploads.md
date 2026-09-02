# File Uploads

File uploads usually have three parts: validate the file, store the file, and save the path in the database.

I prefer keeping the controller thin, validating the file in a Form Request, and moving the storage logic to an Action when the upload is part of a real feature.

## Basic Flow

The form sends a file to the backend. Laravel receives it as an `UploadedFile`, validates it, stores it in a configured disk, and saves the generated path.

The full flow has these parts:

- `Page.vue` sends the file using `multipart/form-data`
- `CreatePostRequest` validates the file
- `PostController` passes validated data to the Action
- `CreatePost` stores the file and creates the record
- `Post` exposes a public image URL

::: code-group

```vue [Page.vue]
<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { store } from '@/routes/posts'
</script>

<template>
    <Form :action="store()" method="post" enctype="multipart/form-data">
        <input type="text" name="title" placeholder="Title">
        <textarea name="content" placeholder="Content" />
        <input type="file" name="image_path">

        <button type="submit">
            Create post
        </button>
    </Form>
</template>
```

```php [Form Request]
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class CreatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // your authorization logic here
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'image_path' => ['nullable', 'image', 'mimes:png,webp,jpeg,jpg', 'max:2048'],
        ];
    }
}
```

```php [Controller]
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreatePost;
use App\Http\Requests\CreatePostRequest;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final readonly class PostController
{
    public function index(): Response
    {
        $posts = Post::query()
            ->select('id', 'title', 'content', 'image_path')
            ->latest()
            ->get();

        return Inertia::render('posts/index', [
            'posts' => $posts,
        ]);
    }

    public function store(CreatePostRequest $request, CreatePost $createPost): RedirectResponse
    {
        $post = $createPost->handle($request->validated());

        return to_route('posts.show', $post)
            ->with('success', 'Post created successfully.');
    }
}
```

```php [Action]
<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Post;
use Illuminate\Http\UploadedFile;

final readonly class CreatePost
{
    public function handle(array $attributes): Post
    {
        $file = $attributes['image_path'] ?? null;

        if ($file instanceof UploadedFile) {
            $attributes['image_path'] = $file->store('posts', 'public');
        }

        return Post::query()->create($attributes);
    }
}
```

```php [Model]
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

#[Appends(['image_url'])]
#[Fillable(['title', 'content', 'image_path'])]
final class Post extends Model
{
    public function casts(): array
    {
        return [
            'id' => 'integer',
            'title' => 'string',
            'content' => 'string',
            'image_path' => 'string',
        ];
    }


    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->image_path
                ? Storage::disk('public')->url($this->image_path)
                : null,
        );
    }

}
```

:::


## What Is Happening

The important part is that the file input name stays consistent across the whole flow:

```md
image_path
```

That same name appears in the Vue form, the Form Request, the Action and the model fillable attributes.

## Frontend Form

The `Page.vue` file is responsible for sending the form data to Laravel. Because the form includes a file input, the form needs `enctype="multipart/form-data"`. Without that, the browser will not send the file correctly.

## Validation

The `CreatePostRequest` validates the incoming request before the controller receives clean data. The `image_path` field is nullable, but if it is present, it must be an image with one of the allowed extensions and a maximum size of `2048` KB.

## Controller

The controller stays small. It does not store the file itself. It only passes the validated request data to the `CreatePost` Action:

```php
$post = $createPost->handle($request->validated());
```

## Storing The File

The Action checks if `image_path` contains an uploaded file. If it does, Laravel gives it as an instance of `UploadedFile`.

```php
if ($file instanceof UploadedFile) {
    $attributes['image_path'] = $file->store('posts', 'public');
}
```

The `store('posts', 'public')` call saves the file in the `public` disk, inside the `posts` folder. It returns the path of the stored file, for example:

```md
posts/example-image.jpg
```

That returned path replaces the original uploaded file in the `$attributes` array. After that, the Action creates the post with a normal Eloquent create:

```php
return Post::query()->create($attributes);
```

## Public URL

The model stores only the path in `image_path`. The `image_url` accessor converts that path into a public URL when the frontend needs to display the image.

So the database keeps this:

```md
posts/example-image.jpg
```

And the frontend can receive this:

```md
/storage/posts/example-image.jpg
```

## Storage

The `store()` method saves the file and returns the path that should be stored in the database.

```php
$path = $image->store('posts', 'public');
```

In this example, the file is stored in the `public` disk, inside a `posts` folder. The database should store the path, not the full URL.

To make public files accessible, Laravel needs the storage link:

```bash
php artisan storage:link
```

## Database

The model usually only needs a column for the path:

```php
$table->string('image_path')->nullable();
```

I prefer storing the file path instead of the full URL because the disk, domain or CDN can change later.

## Updating Files

When replacing an existing file, delete the old file after the new one is stored successfully.

```php
$path = $image->store('posts', 'public');

if ($post->image_path !== null) {
    Storage::disk('public')->delete($post->image_path);
}

$post->update([
    'image_path' => $path,
]);
```

## Notes

For simple uploads, storing the file directly in the controller can be fine. But when the upload is part of a larger flow, I prefer using an Action so the controller does not grow too much.
