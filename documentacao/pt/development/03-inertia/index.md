# Inertia

Notas sobre a ponte entre Laravel e Vue com Inertia.

## Áreas

- **Pages e Props**: dados enviados pelo backend.
- **Forms**: validação, erros e submissão.
- **Navegação**: links, redirects e partial reloads.

## Fluxo Mental

1. Laravel resolve a rota.
2. Controller devolve uma page Inertia.
3. Vue renderiza a page com props.
4. Forms voltam ao Laravel e recebem erros/redirects.
