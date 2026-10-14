# Consultar APIs Externas no Laravel

O cliente HTTP do Laravel (`Http`) faz pedidos **a partir do teu servidor** para outra API. Neste exemplo, alguém chama `GET /products/123` na tua aplicação. O Laravel consulta o produto `123` num fornecedor e devolve JSON a quem fez o pedido.

```text
Cliente → rota da aplicação → ProductController → API externa
Cliente ← resposta JSON da aplicação ← ProductController
```

## Exemplo completo: pedido no controller

Começa por aqui quando uma ação do controller faz um pedido externo curto. Acrescenta o código aos ficheiros indicados. Substitui o URL e o token de exemplo pelos dados do teu fornecedor.

::: code-group

```dotenv [.env — acrescentar estas linhas]
PRODUCT_API_URL=https://api.example.com
PRODUCT_API_TOKEN=your-token
```

```php [config/services.php — acrescentar esta entrada]
'products' => [
    'url' => env('PRODUCT_API_URL'),
    'token' => env('PRODUCT_API_TOKEN'),
],
```

```php [routes/web.php — acrescentar esta rota]
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
            return response()->json(['message' => 'Produto não encontrado.'], 404);
        }

        $response->throw();

        $product = $response->json('product');

        if (! is_array($product)) {
            return response()->json(['message' => 'Resposta inválida do fornecedor.'], 502);
        }

        return response()->json(['product' => $product]);
    }
}
```

:::

O controller lê o URL e o token através de `config()`, consulta o fornecedor, trata um `404` esperado e devolve a resposta **da tua aplicação**. `throw()` lança uma exceção para outras respostas `4xx` ou `5xx`; falhas de ligação e timeouts também lançam exceções. Decide separadamente como a tua aplicação deve comunicar uma indisponibilidade do fornecedor.

Mantém as credenciais reais fora do repositório e do browser. Valida os parâmetros da rota de acordo com as regras do fornecedor antes de os enviares. Numa aplicação só com API, usa `routes/api.php` se estiver ativo; nesse caso, o URL costuma ter o prefixo `/api`.

## Quando extrair para um service?

A versão no controller acima está correta. Extrai a chamada quando outro controller ou job também precisar dela, ou quando a autenticação, a construção do URL, a transformação da resposta ou o tratamento de erros tornarem o controller difícil de ler. Um service é uma classe PHP normal, não uma exigência do Laravel.

No mesmo exemplo, só mudam estes dois ficheiros. O `.env`, a configuração e a rota mantêm-se como estavam:

::: code-group

```php [app/Services/ProductApi.php — novo ficheiro]
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
            throw new \UnexpectedValueException('Resposta inválida do produto.');
        }

        return $product;
    }
}
```

```php [app/Http/Controllers/ProductController.php — substituir o ficheiro]
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
            return response()->json(['message' => 'Produto não encontrado.'], 404);
        }

        return response()->json(['product' => $product]);
    }
}
```

:::

`ProductApi` sabe comunicar com o fornecedor. O controller sabe responder a um pedido feito à tua aplicação. O Laravel consegue injetar esta classe concreta sem registo manual.

## Testar a rota sem chamar o fornecedor

Este teste serve para qualquer uma das versões. `Http::fake()` substitui o pedido de saída; `getJson()` chama a rota **da tua aplicação**.

```php [tests/Feature/ProductControllerTest.php]
<?php

use Illuminate\Support\Facades\Http;

it('devolve um produto obtido da API externa', function () {
    Http::preventStrayRequests();
    Http::fake([
        'api.example.com/products/123' => Http::response([
            'product' => ['name' => 'Café'],
        ]),
    ]);

    $this->getJson(route('products.show', '123'))
        ->assertOk()
        ->assertJsonPath('product.name', 'Café');

    Http::assertSentCount(1);
});
```

Para outros fornecedores, usa `get($url, $query)` para parâmetros na query string e `post($url, $data)` para enviar JSON. Considera `retry()` apenas para operações seguras de repetir; um pedido que altera dados precisa de uma estratégia de idempotência antes de ser repetido.

[Documentação oficial do cliente HTTP do Laravel](https://laravel.com/docs/13.x/http-client)
