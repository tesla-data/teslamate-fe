import { createApp } from 'vue'
import App from './App.vue'
import 'leaflet/dist/leaflet.css'

import router from './router'
import { Icon, Picker, Dialog, Popup, OverLay } from '@nutui/nutui'

createApp(App).use(Icon).use(Dialog).use(Picker).use(Popup).use(OverLay).use(router).mount('#app')
