export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'QR Code Studio - Supranet',
      meta: [
        { name: 'description', content: 'Gerador de QR Code' }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap'
        }
      ]
    }
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon'
  ],

  typescript: {
    strict: true,
    typeCheck: false
  },

  eslint: {
    config: {
      standalone: true
    }
  },

  nitro: {
    preset: 'node-server'
  }
})