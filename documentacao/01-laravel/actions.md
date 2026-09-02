# Actions

Actions are where I prefer to keep reusable business logic. They should be small, explicit, and named after the operation they perform.

The controller should coordinate the HTTP request. The Action should do the actual work.

## Basic Shape

I usually make Actions `final readonly` by default and give them a single public method. I normally use `handle()`, but `__invoke()` is also fine if that is the project convention.

```php
<?php

declare(strict_types=1);

namespace App\Actions;

final readonly class CreateTechnologyAction
{
    public function handle(array $data): Technology
    {
        return Technology::query()->create($data);
    }
}
```

## Used From A Controller

The controller receives the request, validates it through a Form Request, and passes the validated data to the Action.

::: code-group

```php [Controller]
public function store(CreateTechnologyRequest $request, CreateTechnologyAction $createTechnology): RedirectResponse
{
    $technology = $createTechnology->handle($request->validated());

    return to_route('technologies.show', $technology)
        ->with('success', 'Technology created successfully.');
}
```

```php [Action]
final readonly class CreateTechnologyAction
{
    public function handle(array $data): Technology
    {
        return Technology::query()->create($data);
    }
}
```

:::

## With Dependencies

When an Action needs another service, I inject it through the constructor. This keeps the dependency explicit and makes the Action easier to test.

For example, this Action creates a technology and then uses a notifier service to notify the team.

```php
<?php

declare(strict_types=1);

namespace App\Actions;

final readonly class CreateTechnologyAction
{
    public function __construct(private TechnologyNotifier $notifier)
    {
    }

    public function handle(array $data): Technology
    {
        $technology = Technology::query()->create($data);

        $this->notifier->created($technology);

        return $technology;
    }
}
```

The controller does not need to know how the notification works. It only calls the Action.

## Deleting Records

For simple operations, the Action can still be useful because it keeps the controller consistent and gives the behavior a clear name.

```php
<?php

declare(strict_types=1);

namespace App\Actions;

final readonly class DeleteTechnologyAction
{
    public function handle(Technology $technology): void
    {
        $technology->delete();
    }
}
```

## Transactions

If the Action changes multiple things that should succeed or fail together, I wrap the operation in a transaction.

```php
<?php

declare(strict_types=1);

namespace App\Actions;

use Illuminate\Support\Facades\DB;

final readonly class CreateTechnologyWithTagsAction
{
    public function handle(array $data): Technology
    {
        return DB::transaction(function () use ($data): Technology {
            $technology = Technology::query()->create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
            ]);

            $technology->tags()->sync($data['tag_ids'] ?? []);

            return $technology;
        });
    }
}
```

## When To Use Actions

I like Actions when the logic is reusable, has more than one step, or makes the controller easier to read.

I don't think every single line of code needs an Action. If the operation is very small and unlikely to grow, keeping it in the controller can be fine. But once the logic starts involving multiple models, services, jobs, external APIs or transactions, I prefer moving it to an Action.
