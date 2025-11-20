import vuetify from "vite-plugin-vuetify";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
    
  build: {
    transpile: ["vuetify"],
  },

  vite: {
    plugins: [
      vuetify({
        autoImport: true,
      }),
    ],
  },
})
