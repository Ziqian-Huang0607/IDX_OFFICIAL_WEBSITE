import { createApp } from 'vue'
import App from './App.vue'

// Do NOT import style.css here if it's imported in App.vue
const app = createApp(App)
app.mount('#app')