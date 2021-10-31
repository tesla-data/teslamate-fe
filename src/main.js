import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import { Icon } from '@nutui/nutui'

createApp(App).use(Icon).use(router).mount('#app')
