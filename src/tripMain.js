import { createApp } from 'vue'
import TripApp from './TripApp.vue'
import 'leaflet/dist/leaflet.css'

import { Icon } from '@nutui/nutui'

createApp(TripApp).use(Icon).mount('#app')
