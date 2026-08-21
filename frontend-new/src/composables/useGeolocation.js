import { ref } from 'vue'

export function useGeolocation() {
  const latitude = ref(null)
  const longitude = ref(null)
  const error = ref(null)

  const getPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        error.value = 'Géolocalisation non supportée.'
        reject(error.value)
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          latitude.value = pos.coords.latitude
          longitude.value = pos.coords.longitude
          error.value = null
          resolve(pos)
        },
        (err) => {
          error.value = 'Erreur de géolocalisation : ' + err.message
          reject(err)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    })
  }

  return { latitude, longitude, error, getPosition }
}