/// <reference types="node" />
import { defineNuxtConfig } from "nuxt/config";

const apiBase =
  process.env.NODE_ENV === 'production'
    ? 'https:// cccbr-be-e6b9achpa3g6exgf.canadacentral-01.azurewebsites.net/api'
    : 'http://localhost:3001/api'

export default defineNuxtConfig({
  devtools: { enabled: true },
  components: true,

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'emoji-picker',
    },
  },
  app: {
    head: {
      title: 'CCCBR Manager',
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