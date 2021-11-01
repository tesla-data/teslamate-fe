import { createRouter, createWebHashHistory } from 'vue-router'

import Home from './views/Home.vue'
import Settings from './views/Settings.vue'
import Stats from './views/Stats.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})