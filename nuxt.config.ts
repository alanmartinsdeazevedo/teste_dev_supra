// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'QR Code Studio - Supranet',
      meta: [
        { name: 'description', content: 'Gerador de QR Code' }
      ]
    }
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon'
  ],

  // Desativamos a verificação de tipos no build para evitar bloqueios por ficheiros gerados
  typescript: {
    strict: true,
    typeCheck: false 
  },

  // Configuramos o ESLint para não travar o build no Docker
  eslint: {
    config: {
      standalone: true
    }
  },

  nitro: {
    preset: 'node-server'
  }
})