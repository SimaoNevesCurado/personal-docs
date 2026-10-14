# Page Metadata

Page metadata defines how a web page is identified and presented by browsers, search engines, and external platforms.

In a Laravel application, most global metadata is typically defined in the main Blade layout, while page-specific metadata can be dynamically provided by each page.

## Title

The page title is displayed in the browser tab and is also commonly used by search engines as the main title for a page.

For applications using Inertia, page titles can be managed dynamically using the Head component.

```vue
<Head title="Projects" />
```

## Favicon

A favicon is the small icon displayed next to the page title in browser tabs, bookmarks, and other browser interfaces.

Favicon files should be stored in Laravel's `public` directory:

```
public/
├── favicon.svg
└── favicon.ico
```
They can then be referenced from the main Blade layout:

```html
<link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
<link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
```

SVG is recommended for modern browsers because it scales without losing quality. An ICO file can optionally be provided as a fallback.

## Meta Description

The meta description provides a short summary of the page's content. Search engines may use it when displaying the page in search results.


```html
<meta
    name="description"
    content="A short description of the application or page."
>
```

Descriptions should be concise and relevant to the content of each page.

## Open Graph

Open Graph metadata controls how a page is presented when shared on platforms that support the Open Graph protocol.

```html
<meta property="og:title" content="My Application">
<meta property="og:description" content="A short description of the page.">
<meta property="og:image" content="/images/og-image.png">
<meta property="og:url" content="https://example.com">
<meta property="og:type" content="website">
```
