import { createRouter, createWebHashHistory } from 'vue-router'

import Home from './views/Home.vue'
import Settings from './views/Settings.vue'
import ProjectedRange from './views/ProjectedRange.vue'
import Drives from './views/Drives.vue'
import Stats from './views/Stats.vue'
import Updates from './views/Updates.vue'

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
    path: '/updates',
    name: 'Updates',
    component: Updates
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})