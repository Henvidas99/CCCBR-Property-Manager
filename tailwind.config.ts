import type { Config } from 'tailwindcss'

export default {
    content: [
        './app/components/**/*.{js,vue,ts}',
        './app/layouts/**/*.vue',
        './app/pages/**/*.vue',
        './app/plugins/**/*.{js,ts}',
        './app/app.vue',
        './app/error.vue',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#202d59',
                    dark: '#1a2447',
                    light: '#2a3a6e',
                },
                secondary: {
                    DEFAULT: '#a31e22',
                    dark: '#8b1a1d',
                    light: '#c42b2f',
                },
                layout: '#ffffff',
                contrast: '#f5f5f5',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
} satisfies Config