import { createApp } from 'vue'
import TripApp from './TripApp.vue'
import 'leaflet/dist/leaflet.css'

import router from './tripRouter'
import { Icon } from '@nutui/nutui'

createApp(TripApp).use(Icon).use(router).mount('#app')
