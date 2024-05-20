// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", '@nuxtjs/i18n', "@nuxtjs/google-fonts"],
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: ['en', 'ru', 'ua'],
  },
   googleFonts: {
    families: {
      "Kelly Slab": true
    }
   }
})