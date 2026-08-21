import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'       // contient @tailwind etc.
import './assets/theme.css'      // nos variables + classes
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'sweetalert2/dist/sweetalert2.min.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Initialiser le thème avant le montage
import { useThemeStore } from '@/store/theme'
const theme = useThemeStore()
theme.detectSystem()
theme.init()

app.mount('#app')