// Type declarations for custom Nuxt plugins
export {}

declare module '#app' {
  interface NuxtApp {
    $formatDate: (inputDate: string) => string | undefined
    $getDayName: (inputDate: string | Date) => string
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $formatDate: (inputDate: string) => string | undefined
    $getDayName: (inputDate: string | Date) => string
  }
}
