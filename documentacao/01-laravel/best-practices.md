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

```yaml
version: 8
groups:
  - id: aaa9e465-c0cd-470b-95ee-625f3a0a3faa
    name: SEE-INFORMATICA
    icon: fas fa-globe
    color: '#0459b4'
  - id: ed945d9a-4066-4453-9ec9-b79674e648e1
    name: HOME-SERVER
    icon: fas fa-house
    color: '#ff4242'
  - id: 46159ce3-379d-4cc8-93b7-743c9b5fc47a
    name: CM-LEIRIA
    icon: fas fa-building
    color: '#dbd648'
  - id: 2c263748-01e5-4dc2-aa4d-a8806e201b8a
    name: EASYB
    icon: fab fa-dev
    color: '#009411'
    parentGroupId: aaa9e465-c0cd-470b-95ee-625f3a0a3faa
configSync:
  parts: {}
hotkeys:
  toggle-window:
    - Ctrl-Space
  copy-current-path: []
  debug-save-state:
    - Ctrl-Shift-Alt-1
  debug-load-state:
    - Ctrl-Shift-Alt-2
  debug-copy-state:
    - Ctrl-Shift-Alt-3
  debug-paste-state:
    - Ctrl-Shift-Alt-4
  debug-save-output:
    - Ctrl-Shift-Alt-5
  debug-load-output:
    - Ctrl-Shift-Alt-6
  debug-copy-output:
    - Ctrl-Shift-Alt-7
  debug-paste-output:
    - Ctrl-Shift-Alt-8
  ctrl-c:
    - Ctrl-C
  copy:
    - ⌘-C
  paste:
    - ⌘-V
  clear:
    - ⌘-K
  select-all:
    - ⌘-A
  zoom-in:
    - ⌘-=
    - ⌘-Shift-=
  zoom-out:
    - ⌘--
    - ⌘-Shift--
  reset-zoom:
    - ⌘-0
  home:
    - ⌘-Left
    - Home
  end:
    - ⌘-Right
    - End
  previous-word:
    - ⌥-Left
  next-word:
    - ⌥-Right
  delete-previous-word:
    - ⌥-Backspace
  delete-line:
    - ⌘-Backspace
  delete-next-word:
    - ⌥-Delete
  search:
    - ⌘-F
  pane-focus-all:
    - ⌘-Shift-I
  focus-all-tabs:
    - ⌘-⌥-Shift-I
  insert-new-line:
    - ⌥-Shift-Enter
  scroll-to-top:
    - Shift-PageUp
  scroll-page-up:
    - ⌥-PageUp
  scroll-up:
    - Ctrl-Shift-Up
  scroll-down:
    - Ctrl-Shift-Down
  scroll-page-down:
    - ⌥-PageDown
  scroll-to-bottom:
    - Shift-PageDown
  restart-telnet-session: []
  restart-ssh-session: []
  launch-winscp: []
  open-sftp: []
  settings-tab: {}
  settings:
    - ⌘-,
  serial:
    - Alt-K
  restart-serial-session: []
  new-tab:
    - ⌘-T
  new-window:
    - ⌘-N
  profile: {}
  profile-selectors: {}
  group-selectors: {}
  toggle-fullscreen:
    - Ctrl+⌘+F
  close-tab:
    - ⌘-W
  reopen-tab:
    - ⌘-Shift-T
  toggle-last-tab: []
  rename-tab:
    - ⌘-R
  next-tab:
    - Ctrl-Tab
  previous-tab:
    - Ctrl-Shift-Tab
  next-mru-tab: []
  previous-mru-tab: []
  move-tab-left:
    - ⌘-Shift-Left
  move-tab-right:
    - ⌘-Shift-Right
  rearrange-panes:
    - Ctrl-Shift
  tab-1:
    - ⌘-1
  tab-2:
    - ⌘-2
  tab-3:
    - ⌘-3
  tab-4:
    - ⌘-4
  tab-5:
    - ⌘-5
  tab-6:
    - ⌘-6
  tab-7:
    - ⌘-7
  tab-8:
    - ⌘-8
  tab-9:
    - ⌘-9
  tab-10: []
  duplicate-tab: []
  pin-tab: []
  restart-tab: []
  reconnect-tab: []
  disconnect-tab: []
  explode-tab:
    - ⌘-Shift-.
  combine-tabs:
    - ⌘-Shift-,
  tab-11: []
  tab-12: []
  tab-13: []
  tab-14: []
  tab-15: []
  tab-16: []
  tab-17: []
  tab-18: []
  tab-19: []
  tab-20: []
  split-right:
    - ⌘-Shift-D
  split-bottom:
    - ⌘-D
  split-left: []
  split-top: []
  pane-nav-right:
    - ⌘-⌥-Right
  pane-nav-down:
    - ⌘-⌥-Down
  pane-nav-up:
    - ⌘-⌥-Up
  pane-nav-left:
    - ⌘-⌥-Left
  pane-nav-previous:
    - ⌘-⌥-[
  pane-nav-next:
    - ⌘-⌥-]
  pane-nav-1: []
  pane-nav-2: []
  pane-nav-3: []
  pane-nav-4: []
  pane-nav-5: []
  pane-nav-6: []
  pane-nav-7: []
  pane-nav-8: []
  pane-nav-9: []
  pane-maximize:
    - ⌘-⌥-Enter
  close-pane:
    - ⌘-Shift-W
  pane-increase-vertical: []
  pane-decrease-vertical: []
  pane-increase-horizontal: []
  pane-decrease-horizontal: []
  profile-selector:
    - ⌘-E
  switch-profile:
    - ⌘-Shift-E
  command-selector:
    - ⌘-Shift-P
  switch-meta-option:
    - ⌘-⌥-O
terminal:
  showBuiltinProfiles: false
  searchOptions: {}
  colorScheme:
    name: Tabby Default
    foreground: '#cacaca'
    background: '#171717'
    cursor: '#bbbbbb'
    colors:
      - '#000000'
      - '#ff615a'
      - '#b1e969'
      - '#ebd99c'
      - '#5da9f6'
      - '#e86aff'
      - '#82fff7'
      - '#dedacf'
      - '#313131'
      - '#f58c80'
      - '#ddf88f'
      - '#eee5b2'
      - '#a5c7ff'
      - '#ddaaff'
      - '#b7fff9'
      - '#ffffff'
  lightColorScheme:
    name: TokyoNight
    foreground: '#c0caf5'
    background: '#1a1b26'
    cursor: '#c0caf5'
    colors:
      - '#15161e'
      - '#f7768e'
      - '#9ece6a'
      - '#e0af68'
      - '#7aa2f7'
      - '#bb9af7'
      - '#7dcfff'
      - '#a9b1d6'
      - '#414868'
      - '#f7768e'
      - '#9ece6a'
      - '#e0af68'
      - '#7aa2f7'
      - '#bb9af7'
      - '#7dcfff'
      - '#c0caf5'
  customColorSchemes: []
  profile: local:binzsh
  hideTabIndex: true
  font: JetBrains Mono NL
  ligatures: true
ssh:
  knownHosts:
    - host: 192.168.2.242
      port: 22
      type: ecdsa-sha2-nistp256
      digest: vpthTgPV0kXiI2wc2V/MWpRW0MTeHQ94qLoMEj+y6Fo=
    - host: 192.168.16.50
      port: 22
      type: ecdsa-sha2-nistp256
      digest: 8DCkKAhjRfy31ZHl3Koca6EZhJff9NbgNYnl3YUHiOo=
    - host: 192.168.2.220
      port: 22
      type: ecdsa-sha2-nistp256
      digest: yGlvZyqaVO3GHk2YcQMPoYwNXlvZgBWoYnb+InrVv58=
    - host: 192.168.2.221
      port: 22
      type: ecdsa-sha2-nistp256
      digest: 5DgG7mxOJUPIHvLYsu7iz7+ijcDyxniwEz8coK+5BPI=
    - host: 79.143.185.201
      port: 22
      type: ecdsa-sha2-nistp256
      digest: NkqcYuHsyLiRi7WLcDD30xnw4YGd59ly8QqObkPaZJQ=
    - host: 192.168.2.215
      port: 22
      type: ecdsa-sha2-nistp256
      digest: dYVazTi2et1vrggKABS1SVpoZbEtKnIm8c0hjyPTNyY=
clickableLinks: {}
accessibility: {}
appearance:
  vibrancy: true
  opacity: 0.99
  colorSchemeMode: auto
hacks: {}
providerBlacklist: []
commandBlacklist: []
language: en-US
enableWelcomeTab: false
pluginBlacklist: []
profileDefaults:
  ssh:
    disableDynamicTitle: true
  split-layout:
    type: split-layout
    options: {}
profiles:
  - type: ssh
    name: VM GITLAB
    options:
      host: 192.168.2.220
      user: developer
      algorithms: {}
      input: {}
      auth: password
    weight: -1
    color: '#FAAA0A'
    icon: fab fa-gitlab
    id: ssh:custom:VM-GITLAB:5619d2de-3419-4549-8b02-5f56be52071f
  - type: ssh
    name: VM DATABASE
    options:
      host: 192.168.2.215
      user: simao.curado
      algorithms: {}
      input: {}
      auth: publicKey
      privateKeys:
        - file:///Users/simaocurado/.ssh/id_rsa
    weight: -1
    group: 2c263748-01e5-4dc2-aa4d-a8806e201b8a
    id: ssh:custom:VM-DATABASE:6a757bdb-54c2-4178-b030-27adb2246cb7
    icon: fas fa-database
    color: '#2651D4'
  - type: ssh
    name: VPS
    options:
      host: 79.143.185.201
      algorithms: {}
      input: {}
      auth: password
    weight: -1
    icon: fas fa-server
    group: ed945d9a-4066-4453-9ec9-b79674e648e1
    id: ssh:custom:VPS:db343237-a782-46ac-898f-37fa0a29e73b
  - type: ssh
    icon: fas fa-server
    options:
      user: developer
      algorithms: {}
      input: {}
      host: 192.168.2.242
      auth: password
    weight: -1
    name: VM APPS
    color: '#27BEF5'
    id: ssh:custom:VM-APPS:89d368a9-1335-40ec-a0a8-cdbd0d9bb6e2
    group: aaa9e465-c0cd-470b-95ee-625f3a0a3faa
  - type: ssh
    name: VM APPS-2
    icon: fas fa-server
    options:
      host: 192.168.16.50
      user: developer
      algorithms: {}
      input: {}
      auth: password
    weight: -1
    color: '#0AB6FA'
    group: aaa9e465-c0cd-470b-95ee-625f3a0a3faa
    id: ssh:custom:VM-APPS-2:712a6e52-1e83-41d4-b231-94eb0e12a17d
  - type: ssh
    name: VM GITLAB
    icon: fab fa-gitlab
    options:
      host: 192.168.2.220
      user: developer
      algorithms: {}
      input: {}
      auth: password
    weight: -1
    color: '#FAAA0A'
    group: aaa9e465-c0cd-470b-95ee-625f3a0a3faa
    id: ssh:custom:VM-GITLAB:c2bdb710-262f-4c75-b57c-d94ca59d60b6
  - type: ssh
    name: VM RUNNERS/Coolify
    icon: fas fa-robot
    options:
      host: 192.168.2.221
      user: developer
      algorithms: {}
      input: {}
      auth: password
    weight: -1
    terminalColorScheme:
      name: AtelierSulphurpool
      foreground: '#979db4'
      background: '#202746'
      cursor: '#979db4'
      colors:
        - '#202746'
        - '#c94922'
        - '#ac9739'
        - '#c08b30'
        - '#3d8fd1'
        - '#6679cc'
        - '#22a2c9'
        - '#979db4'
        - '#6b7394'
        - '#c76b29'
        - '#293256'
        - '#5e6687'
        - '#898ea4'
        - '#dfe2f1'
        - '#9c637a'
        - '#f5f7ff'
    color: '#C2BEBE'
    group: aaa9e465-c0cd-470b-95ee-625f3a0a3faa
    id: ssh:custom:VM-RUNNERS:d39059b5-9a6f-41da-8e1e-6fc53fb64d5a
  - type: ssh
    name: BD-Systems
    icon: fas fa-desktop
    options:
      host: 10.104.12.26
      user: developer
      algorithms: {}
      input: {}
      auth: password
    weight: -1
    group: 46159ce3-379d-4cc8-93b7-743c9b5fc47a
    id: ssh:custom:BD-Systems:7ae727d1-f0c3-4e13-8e9b-fcf0d91c19c9
showProfileTree: true
profileBlacklist:
  - local:binbash
```

If the API is expected to evolve, I also prefer versioning it early instead of waiting until breaking changes are harder to manage.
