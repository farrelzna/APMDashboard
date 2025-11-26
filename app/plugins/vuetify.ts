import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VDateInput } from 'vuetify/labs/VDateInput'
import '@mdi/font/css/materialdesignicons.css'
import VueApexCharts from 'vue3-apexcharts'
import VueTablerIcons from 'vue-tabler-icons'

import '@/assets/scss/style.scss'
import { BLUE_THEME } from '@/theme/LightTheme'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components: {
      ...components,
      VDateInput,
    },
    directives,

    theme: {
      defaultTheme: 'BLUE_THEME',
      themes: {
        BLUE_THEME: BLUE_THEME as ThemeDefinition,
      },
    },

    defaults: {
      VCard: {
        rounded: 'xl',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
      },
      VTextarea: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
      },
      VListItem: {
        minHeight: '45px',
      },
      VTooltip: {
        location: 'top',
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
  nuxtApp.vueApp.use(VueApexCharts)
  nuxtApp.vueApp.use(VueTablerIcons)
})
