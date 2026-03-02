/// <reference types="node" />
import { defineNuxtConfig } from "nuxt/config";

const apiBase =
  process.env.NODE_ENV === 'production'
    ? 'https://alienrealty-backend-e9f2c9grecgjcjbz.centralus-01.azurewebsites.net/api'
    : 'http://localhost:5000/api'

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
      apiBase: apiBase,
      googleMapsApiKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
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