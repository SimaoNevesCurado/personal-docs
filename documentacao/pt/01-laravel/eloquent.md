# Eloquent

Eloquent é o ORM do Laravel. Permite consultar e atualizar registos da base de dados através de models, sem escrever SQL manual para todas as operações.

Eu prefiro usar models, relationships e query scopes antes de recorrer a raw queries. Na maioria dos casos, tornam a intenção mais clara e mantêm o código próximo das convenções do Laravel.

## Queries Base

Começa queries com `Model::query()` quando estás a construir uma chain.

```php
Post::query()
    ->where('is_featured', true)
    ->latest()
    ->get();
```

Isto torna a query explícita e fácil de expandir.

Usa `first()` quando esperas um model ou `null`:

```php
$post = Post::query()
    ->where('slug', $slug)
    ->first();
```

Usa `firstOrFail()` quando não encontrar o model deve devolver um `404`:

```php
$post = Post::query()
    ->where('slug', $slug)
    ->firstOrFail();
```

## Selecionar Colunas

Seleciona apenas as colunas necessárias quando estás a devolver listas.

```php
Post::query()
    ->select('id', 'title', 'slug', 'published_at')
    ->latest('published_at')
    ->get();
```

Isto mantém a query e a resposta mais pequenas, especialmente em tabelas com campos de texto grandes ou colunas JSON.

## Relationships

Usa relationships em vez de juntar dados manualmente no código da aplicação.

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

O nome da relationship deve ler-se naturalmente na query. Um post pertence a um user, e um post tem muitos comments.

## Eager Loading

Usa `with()` quando sabes que a view ou resposta da API vai precisar de dados relacionados.

```php
Post::query()
    ->with(['user', 'comments'])
    ->latest()
    ->get();
```

Isto ajuda a evitar N+1 queries.

Também podes limitar as colunas da relationship:

```php
Post::query()
    ->with('user:id,name')
    ->select('id', 'user_id', 'title', 'slug')
    ->latest()
    ->get();
```

Quando limitas colunas, lembra-te de incluir a foreign key. Neste exemplo, `user_id` é necessário para o Eloquent ligar cada post ao seu user.

## Filtrar Por Relationships

Usa `whereHas()` quando a query depende de uma relationship.

```php
Post::query()
    ->whereHas('comments', function ($query): void {
        $query->where('is_approved', true);
    })
    ->latest()
    ->get();
```

Usa `withWhereHas()` quando queres filtrar por uma relationship e fazer eager load da mesma relationship já filtrada.

```php
Post::query()
    ->withWhereHas('comments', function ($query): void {
        $query->where('is_approved', true);
    })
    ->latest()
    ->get();
```

## Scopes

Usa scopes quando uma condição representa uma regra reutilizável.

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

Scopes são úteis quando fazem a query ler-se como o domínio. Evita criar um scope para cada pequena condição se só for usado uma vez.

## Queries Condicionais

Usa `when()` quando um filtro é opcional.

```php
Post::query()
    ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
        $query->where('title', 'like', '%' . $request->string('search') . '%');
    })
    ->latest()
    ->paginate();
```

Isto evita grandes blocos `if` à volta da query.

## Paginação

Usa paginação para listas que podem crescer.

```php
$posts = Post::query()
    ->select('id', 'title', 'slug', 'published_at')
    ->latest('published_at')
    ->paginate(15);
```

Com Inertia, devolve o resultado paginado como prop:

```php
return Inertia::render('posts/index', [
    'posts' => $posts,
]);
```

## Criar Registos

Usa dados validados de um Form Request ao criar registos.

```php
$post = Post::query()->create($request->validated());
```

O model deve definir os campos mass assignable com `#[Fillable]` ou `$fillable`, dependendo da convenção do projeto.

## Atualizar Registos

Para updates simples, atualiza diretamente o model.

```php
$post->update($request->validated());
```

Se o update tem vários passos, side effects, uploads de ficheiros ou notificações, movo esse fluxo para uma Action.

## Apagar Registos

Para deletes simples, chama `delete()` no model.

```php
$post->delete();
```

Quando apagar exige trabalho extra, como remover ficheiros enviados ou detach de relationships, prefiro colocar isso numa Action.

## Transactions

Usa uma transaction quando várias alterações na base de dados devem funcionar ou falhar juntas.

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () use ($data): void {
    $post = Post::query()->create($data);

    $post->tags()->attach($data['tag_ids']);
});
```

Se o post for criado mas as tags falharem, a transaction faz rollback de tudo.

## Debug De Queries

Usa `toSql()` quando queres inspecionar o SQL gerado.

```php
$sql = Post::query()
    ->where('is_featured', true)
    ->toSql();
```

Usa `dd()` com cuidado enquanto estás a fazer debug localmente:

```php
Post::query()
    ->where('is_featured', true)
    ->dd();
```

Não deixes helpers de debug de queries em código commitado.

## Notas

- Prefere `Model::query()` para query chains legíveis.
- Usa relationships antes de juntar dados manualmente.
- Usa eager loading para evitar N+1 queries.
- Prefere scopes quando a query representa uma regra reutilizável.
- Mantém fluxos grandes em Actions em vez de os esconder dentro de query chains.
