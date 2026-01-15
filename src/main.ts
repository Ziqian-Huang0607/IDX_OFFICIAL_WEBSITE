import { createApp } from 'vue'
import { inject } from '@vercel/analytics'
import App from './App.vue'

// Inject Vercel Web Analytics
inject()

// Do NOT import style.css here if it's imported in App.vue
const app = createApp(App)
app.mount('#app')