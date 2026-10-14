# Controllers

Controllers should stay thin and focused on HTTP concerns. In most cases, they should receive the request, call an Action, and return a response or redirect.

I don't like controllers becoming the place where validation, authorization, queries and business logic all get mixed together. The controller should mostly coordinate the request flow.

For me, a controller can:

- receive route models and Form Requests
- call Actions
- return views, resources, responses or redirects
- flash simple success/error messages

It should avoid:

- complex queries
- business rules
- inline validation
- large conditionals
- long private helper methods that only exist because the controller is doing too much


## Basic controller

This is the basic shape of a Laravel controller. It receives the request, interacts with the model, and returns a response.

```php
<?php

declare(strict_types=1);

final readonly class TechnologyController
{
    public function index(): View
    {
        return view('technologies.index', [
            'technologies' => Technology::query()->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $technology = Technology::query()->create($validated);

        return to_route('technologies.show', $technology)
            ->with('success', 'Technology created successfully.');
    }

    public function destroy(Technology $technology): RedirectResponse
    {
        $technology->delete();

        return to_route('technologies.index')
            ->with('success', 'Technology deleted successfully.');
    }
}
```

This works, but as the feature grows, I prefer moving validation to Form Requests and business logic to Actions.

## Advanced controller (using Action Pattern)

::: code-group

```php [Controller]
<?php

declare(strict_types=1);

final readonly class TechnologyController
{
    public function index(ListTechnologiesAction $listTechnologies): View
    {
        return view('technologies.index', [
            'technologies' => $listTechnologies->handle(),
        ]);
    }

    public function store(CreateTechnologyRequest $request, CreateTechnologyAction $createTechnology): RedirectResponse
    {
        $technology = $createTechnology->handle($request->validated());

        return to_route('technologies.show', $technology)
            ->with('success', 'Technology created successfully.');
    }

    public function destroy(Technology $technology, DeleteTechnologyAction $deleteTechnology): RedirectResponse
    {
        $deleteTechnology->handle($technology);

        return to_route('technologies.index')
            ->with('success', 'Technology deleted successfully.');
    }
}
```

```php [Form Request]
<?php

declare(strict_types=1);

final class CreateTechnologyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
```

```php [Create Action]
<?php

declare(strict_types=1);

final readonly class CreateTechnologyAction
{
    public function handle(array $data): Technology
    {
        return Technology::query()->create($data);
    }
}
```

```php [Delete Action]
<?php

declare(strict_types=1);

final readonly class DeleteTechnologyAction
{
    public function handle(Technology $technology): void
    {
        $technology->delete();
    }
}
```

:::

This keeps the controller easy to scan. If I want to understand the request, I check the Form Request. If I want to understand what the application does, I check the Action.

## Naming

I usually stick to Laravel's resource method names when they fit the feature:

- `index`
- `create`
- `store`
- `show`
- `edit`
- `update`
- `destroy`


## Single action controllers

If the action is not a normal CRUD operation, I prefer a dedicated controller or invokable controller instead of forcing everything into a resource controller.

```php
final readonly class PublishTechnologyController
{
    public function __invoke(Technology $technology, PublishTechnologyAction $publishTechnology): RedirectResponse
    {
        $publishTechnology->handle($technology);

        return to_route('technologies.show', $technology)
            ->with('success', 'Technology published successfully.');
    }
}
```
