import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Simão Curado',
  titleTemplate: ':title | Simão Curado',
  description: 'Personal documentation for Laravel, Vue and Inertia',
  lang: 'en-US',
  cleanUrls: true,
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ],
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'Simão Curado',
      description: 'Personal documentation for Laravel, Vue and Inertia',
      themeConfig: {
        nav: [
          { text: 'home', link: '/' },
          { text: 'documentation', link: '/00-start-here/quick-notes' }
        ],
        sidebar: [
          {
            text: 'Start Here',
            collapsed: true,
            items: [
              { text: 'Quick Notes', link: '/00-start-here/quick-notes' },
            ]
          },
          {
            text: 'Laravel',
            collapsed: true,
            items: [
              { text: 'Best Practices', link: '/01-laravel/best-practices' },
              { text: 'Controllers', link: '/01-laravel/controllers' },
              { text: 'Actions', link: '/01-laravel/actions' },
              { text: 'Routes', link: '/01-laravel/routes' },
              { text: 'Form Requests', link: '/01-laravel/form-requests' },
              { text: 'Models', link: '/01-laravel/models' },
              { text: 'Upload Files', link: '/01-laravel/file-uploads' },
              { text: 'Eloquent', link: '/01-laravel/eloquent' },
              { text: 'Handling Errors', link: '/01-laravel/error-handle' },
              { text: 'Queues/Jobs', link: '/01-laravel/queues' },
              { text: 'Mail Notifications', link: '/01-laravel/mail-notifications' },
              { text: 'Page Metadata', link: '/01-laravel/metadata' },


              { text: 'Testing', link: '/01-laravel/testing' },
              { text: 'Commands', link: '/01-laravel/commands' },
              { text: 'Tools', link: '/01-laravel/tools' },

            ]
          },
          {
            text: 'Vue',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/02-vue/' },
              { text: 'Components', link: '/02-vue/components' },
              { text: 'Composables', link: '/02-vue/composables' },
              { text: 'Modals', link: '/02-vue/modals' }
            ]
          },
          {
            text: 'Inertia',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/03-inertia/' },
              { text: 'Forms', link: '/03-inertia/forms' },
              { text: 'Pages and Props', link: '/03-inertia/pages-props' }
            ]
          },
          {
            text: 'Workflows',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/04-workflows/' },
              { text: 'New Project', link: '/04-workflows/new-project' },
              { text: 'Deploy', link: '/04-workflows/deploy' },
              { text: 'Debug', link: '/04-workflows/debug' }
            ]
          }
        ],
        outline: {
          label: 'On This Page',
          level: [2, 3]
        },
        docFooter: {
          prev: 'Previous',
          next: 'Next'
        },
        darkModeSwitchLabel: 'Theme',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Return to top'
      }
    },
    pt: {
      label: 'Português',
      lang: 'pt-PT',
      title: 'Simão Curado',
      description: 'Documentação pessoal para Laravel, Vue e Inertia',
      themeConfig: {
        nav: [
          { text: 'home', link: '/pt/' },
          { text: 'documentation', link: '/pt/00-inicio/notas-rapidas' }
        ],
        sidebar: [
          {
            text: 'Início',
            collapsed: true,
            items: [
              { text: 'Notas Rápidas', link: '/pt/00-inicio/notas-rapidas' },
              { text: 'Snippets', link: '/pt/00-inicio/snippets' },
              { text: 'Code Groups VitePress', link: '/pt/00-inicio/vitepress-code-groups' }
            ]
          },
          {
            text: 'Laravel',
            collapsed: true,
            items: [
              { text: 'Visão Geral', link: '/pt/01-laravel/' },
              { text: 'Comandos', link: '/pt/01-laravel/comandos' },
              { text: 'Eloquent', link: '/pt/01-laravel/eloquent' },
              { text: 'Boas Práticas', link: '/pt/01-laravel/boas-praticas' }
            ]
          },
          {
            text: 'Vue',
            collapsed: true,
            items: [
              { text: 'Visão Geral', link: '/pt/02-vue/' },
              { text: 'Componentes', link: '/pt/02-vue/componentes' },
              { text: 'Composables', link: '/pt/02-vue/composables' },
              { text: 'Modais', link: '/pt/02-vue/modals' }
            ]
          },
          {
            text: 'Inertia',
            collapsed: true,
            items: [
              { text: 'Visão Geral', link: '/pt/03-inertia/' },
              { text: 'Forms', link: '/pt/03-inertia/forms' },
              { text: 'Pages e Props', link: '/pt/03-inertia/pages-props' }
            ]
          },
          {
            text: 'Workflows',
            collapsed: true,
            items: [
              { text: 'Visão Geral', link: '/pt/04-workflows/' },
              { text: 'Novo Projeto', link: '/pt/04-workflows/novo-projeto' },
              { text: 'Deploy', link: '/pt/04-workflows/deploy' },
              { text: 'Debug', link: '/pt/04-workflows/debug' }
            ]
          }
        ],
        outline: {
          label: 'Nesta Página',
          level: [2, 3]
        },
        docFooter: {
          prev: 'Anterior',
          next: 'Seguinte'
        },
        darkModeSwitchLabel: 'Tema',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Voltar ao topo'
      }
    }
  },
  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/SimaoNevesCurado/personal-docs' }
    ],
    search: {
      provider: 'local'
    }
  }
})
