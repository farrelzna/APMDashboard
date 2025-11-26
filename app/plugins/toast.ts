// Vue Sonner - Modern toast notifications
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

export default defineNuxtPlugin((nuxtApp) => {
  // Auto-import Toaster component globally
  nuxtApp.vueApp.component('Toaster', Toaster)
})
