declare module 'nuxt/schema' {
    interface RuntimeConfig {
        // privado (server only)
    }

    interface PublicRuntimeConfig {
        apiBase: string
    }
}

export { }