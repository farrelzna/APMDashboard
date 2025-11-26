export default defineNuxtPlugin(() => {
  return {
    provide: {
      formatDate: (inputDate: string): string | undefined => {
        if (!inputDate) return undefined

        try {
          const dateParts = inputDate.split('-')
          if (dateParts.length !== 3) return undefined

          const formattedDate = new Date(
            `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`
          ).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })

          return formattedDate
        } catch (error) {
          console.error('Error formatting date:', error)
          return undefined
        }
      },

      getDayName: (inputDate: string | Date): string => {
        try {
          const date = new Date(inputDate)
          const formatDate = date.toLocaleDateString('en-GB', {
            weekday: 'long'
          })

          return formatDate
        } catch (error) {
          console.error('Error getting day name:', error)
          return ''
        }
      }
    }
  }
})
