# Handling Errors


## Form Errors


## Error Pages
In local development, Laravel's default exception page is useful because it shows the stack trace and helps you debug the problem.

In production, users should not see that page. It exposes too much internal information and creates a poor user experience. With Inertia, you can intercept exception responses and render your own error pages instead.

Register the exception handler in your Inertia middleware, usually in `HandleInertiaRequests`.

:::code-group

```php [HandleInertiaRequests.php]
<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Inertia\Exceptions\ExceptionResponse;
use Inertia\Inertia;

final class HandleInertiaRequests extends Middleware
{
    public function boot(): void
        {
            $this->configureDefaults();


            Inertia::handleExceptionsUsing(function (ExceptionResponse $response) {
                if (! app()->isProduction()) {
                    return null;
                }

                return match (true) {
                    $response->statusCode() === 404 => $response
                        ->render('errors/NotFound')
                        ->withSharedData(),

                    $response->statusCode() === 403 => $response
                        ->render('errors/Forbidden')
                        ->withSharedData(),

                    $response->statusCode() === 419 => $response
                        ->render('errors/PageExpired')
                        ->withSharedData(),

                    $response->statusCode() === 429 => $response
                        ->render('errors/TooManyRequests')
                        ->withSharedData(),

                    $response->statusCode() >= 500 => $response
                        ->render('errors/ServerError')
                        ->withSharedData(),

                    default => null,
                };
            });

        }
}
```


```php [NotFound.vue (example)]
<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { ArrowLeft, SearchX } from '@lucide/vue';
import { home } from '@/routes';
</script>

<template>
    <Head title="Page not found" />

    <main class="min-h-screen bg-white font-mono text-[#111111]">
        <div class="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6">
            <header class="flex items-center justify-between border-b border-black pb-5">
                <p class="text-sm font-black tracking-[0.35em] text-red-600">
                    404
                </p>
                <p class="text-xs font-bold tracking-[0.25em] text-black/60">
                    ACCESS_DENIED
                </p>
            </header>

            <section class="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[0.85fr_1.15fr]">
                <div class="border border-black bg-gray-100 p-8">
                    <SearchX class="h-14 w-14 text-red-600" />
                    <p class="mt-8 text-xs font-black tracking-[0.3em] text-black/50">
                        ROUTE_NOT_FOUND
                    </p>
                    <h1 class="mt-4 text-5xl font-black tracking-tight sm:text-7xl">
                        Nothing to see
                    </h1>
                </div>

                <div>
                    <p class="max-w-xl text-lg leading-8 text-black/70">
                        A página que tentaste abrir não existe ou não está disponível.
                        Se chegaste aqui por engano, volta ao portfolio.
                    </p>

                    <Link
                        :href="home()"
                        class="mt-8 inline-flex items-center gap-3 border border-black bg-red-600 px-5 py-3 text-sm font-black tracking-wide text-white transition hover:bg-red-700"
                    >
                        <ArrowLeft class="h-4 w-4" />
                        BACK_HOME
                    </Link>
                </div>
            </section>
        </div>
    </main>
</template>

```




:::





:::tip Note

Do not hide errors from yourself during development. Only replace the default error pages in production.

Also, do not treat every error the same way. A missing page, an expired session and a server crash are different problems, even if the user-facing page is intentionally simple.

:::
