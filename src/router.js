import { createRouter, createWebHashHistory } from 'vue-router'

import Home from './views/Home.vue'
import Settings from './views/Settings.vue'
import ProjectedRange from './views/ProjectedRange.vue'
import Charges from './views/Charges.vue'
import Charge from './views/Charge.vue'
import Drives from './views/Drives.vue'
import Drive from './views/Drive.vue'
import Stats from './views/Stats.vue'
import Updates from './views/Updates.vue'
import Teslafi from './views/Teslafi.vue'
import Trip from './views/Trip.vue'

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
    path: '/projected-range',
    name: 'ProjectedRange',
    component: ProjectedRange
  },
  {
    path: '/charges',
    name: 'Charges',
    component: Charges
  },
  {
    path: '/charge',
    name: 'Charge',
    component: Charge
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats
  },
  {
    path: '/drives',
    name: 'Drives',
    component: Drives
  },
  {
    path: '/drive',
    name: 'Drive',
    component: Drive
  },
  {
    path: '/updates',
    name: 'Updates',
    component: Updates
  },
  {
    path: '/teslafi',
    name: 'Teslafi',
    component: Teslafi
  },
  {
    path: '/trip',
    name: 'Trip',
    component: Trip
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (window._hmt) {
    if (to.path) {
      window._hmt.push(['_trackPageview', to.fullPath])
    }
  }
  next()
})

export default router