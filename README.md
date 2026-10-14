# Simão Curado Personal Docs

Personal public documentation built with [VitePress](https://vitepress.dev/).

Live documentation: [docs.simaocurado.dev](https://docs.simaocurado.dev)

This repository contains notes, snippets, commands and practical references for development, Linux, DevOps and DevSecOps.

## Why This Exists

This documentation is my personal learning space. I use it to organize concepts, keep useful commands close and document patterns I do not want to lose.

It is public so I can access it whenever I need it and so it may help other people who are starting out. Some notes may be incomplete, outdated or wrong. If you find something that can be improved, feel free to open an issue or contact me.

## Links

- Website: [simaocurado.dev](https://simaocurado.dev)
- Documentation: [docs.simaocurado.dev](https://docs.simaocurado.dev)
- LinkedIn: [linkedin.com/in/simaonevescurado](https://www.linkedin.com/in/simaonevescurado)
- Repository: [github.com/SimaoNevesCurado/personal-docs](https://github.com/SimaoNevesCurado/personal-docs)

## Development

Install dependencies:

```bash
npm install
```

Run the local docs server:

```bash
npm run docs:dev
```

Open [http://127.0.0.1:5174/](http://127.0.0.1:5174/) in your browser.

Build the site:

```bash
npm run docs:build
```

Preview the production build:

```bash
npm run docs:preview
```

## Project Structure

```txt
documentacao/
  00-start-here/
  development/
    01-laravel/
    02-vue/
    03-inertia/
    04-workflows/
    05-rust/
  linux/
  devops-devsecops/
  pt/                  # Portuguese mirrors this structure
```

English is the default language. Portuguese content lives under `/pt/`.
Pages moved into `development/` have redirects from their previous URLs.

## License

This project is open source and available under the [MIT License](./LICENSE).
