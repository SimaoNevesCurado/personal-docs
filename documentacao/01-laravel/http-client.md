# Fetching Data From External APIs

Laravel's HTTP client (`Http`) makes requests **from your server** to another API. In this example, someone calls `GET /products/123` on your application. Laravel requests product `123` from a provider and returns JSON to the caller.

```text
Client → your route → ProductController → external API
Client ← your JSON response ← ProductController
```

## Complete Example: Call the API From the Controller

Start here when one controller action makes one short external request. Add the following to the indicated files. Replace the example URL and token with your provider's values.

::: code-group

```dotenv [.env — add these lines]
PRODUCT_API_URL=https://api.example.com
PRODUCT_API_TOKEN=your-token
```

```php [config/services.php — add this entry]
'products' => [
    'url' => env('PRODUCT_API_URL'),
    'token' => env('PRODUCT_API_TOKEN'),
],
```

```php [routes/web.php — add this route]
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/products/{code}', [ProductController::class, 'show'])
    ->name('products.show');
```

```php [app/Http/Controllers/ProductController.php]
<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

final class ProductController extends Controller
{
    public function show(string $code): JsonResponse
    {
        $response = Http::baseUrl((string) config('services.products.url'))
            ->withToken((string) config('services.products.token'))
            ->acceptJson()
            ->connectTimeout(3)
            ->timeout(10)
            ->get('/products/'.rawurlencode($code));

        if ($response->notFound()) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        $response->throw();

        $product = $response->json('product');

        if (! is_array($product)) {
            return response()->json(['message' => 'Invalid provider response.'], 502);
        }

        return response()->json(['product' => $product]);
    }
}
```

:::

The controller reads the URL and token through `config()`, calls the provider, handles an expected `404`, and returns **your application's** response. `throw()` raises an exception for other `4xx` or `5xx` responses; connection failures and timeouts also raise exceptions. Decide separately how your application should report provider outages.

Keep real credentials out of the repository and browser. Validate route parameters according to the provider's rules before sending them. For an API-only application, use `routes/api.php` if it is enabled; its URL normally has the `/api` prefix.

## When Should This Become a Service?

The controller version above is fine. Extract the provider call when another controller or job needs it, or when authentication, URL construction, response mapping, or error handling grows enough to obscure the controller's job. A service is an ordinary PHP class, not a Laravel requirement.

For the same example, only these two files change. The `.env`, configuration, and route stay as shown above:

::: code-group

```php [app/Services/ProductApi.php — new file]
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

final class ProductApi
{
    /** @return array<string, mixed>|null */
    public function find(string $code): ?array
    {
        $response = Http::baseUrl((string) config('services.products.url'))
            ->withToken((string) config('services.products.token'))
            ->acceptJson()
            ->connectTimeout(3)
            ->timeout(10)
            ->get('/products/'.rawurlencode($code));

        if ($response->notFound()) {
            return null;
        }

        $response->throw();

        $product = $response->json('product');

        if (! is_array($product)) {
            throw new \UnexpectedValueException('Invalid product response.');
        }

        return $product;
    }
}
```

```php [app/Http/Controllers/ProductController.php — replace file]
<?php

namespace App\Http\Controllers;

use App\Services\ProductApi;
use Illuminate\Http\JsonResponse;

final class ProductController extends Controller
{
    public function show(string $code, ProductApi $productApi): JsonResponse
    {
        $product = $productApi->find($code);

        if ($product === null) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        return response()->json(['product' => $product]);
    }
}
```

:::

`ProductApi` knows how to talk to the provider. The controller knows how to answer a request to your application. Laravel can inject this concrete class without manual registration.

## Test the Route Without Calling the Provider

This test works with either version. `Http::fake()` replaces the outgoing request; `getJson()` calls **your** route.

```php [tests/Feature/ProductControllerTest.php]
<?php

use Illuminate\Support\Facades\Http;

it('returns a product from the provider', function () {
    Http::preventStrayRequests();
    Http::fake([
        'api.example.com/products/123' => Http::response([
            'product' => ['name' => 'Coffee'],
        ]),
    ]);

    $this->getJson(route('products.show', '123'))
        ->assertOk()
        ->assertJsonPath('product.name', 'Coffee');

    Http::assertSentCount(1);
});
```

For other providers, use `get($url, $query)` for query parameters and `post($url, $data)` for JSON request bodies. Consider `retry()` only for safe, repeatable operations; a state-changing request needs an idempotency strategy before it is retried.

[Laravel HTTP client documentation](https://laravel.com/docs/13.x/http-client)
