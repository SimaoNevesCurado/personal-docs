# Inertia

Notes about the bridge between Laravel and Vue with Inertia.

## Areas

- **Pages and Props**: data sent by the backend.
- **Forms**: validation, errors and submission.
- **Navigation**: links, redirects and partial reloads.

## Mental Flow

1. Laravel resolve a rota.
2. The controller returns an Inertia page.
3. Vue renders the page with props.
4. Forms go back to Laravel and receive errors/redirects.
