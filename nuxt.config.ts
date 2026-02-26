import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },
  components: true,

  app: {
    head: {
      title: 'CCCBR Property Manager',
      meta: [
        { name: 'description', content: 'Sistema de gestión CCCBR' }
      ]
    }
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },

  runtimeConfig: {
    public: {
      apiBase: 'https://localhost:5001/api'
    }
  },

  typescript: {
    strict: true
  },

  vite: {
    server: {
      watch: { usePolling: true }
    }
  },

  compatibilityDate: '2026-02-25'
})