import { createRouter, createWebHashHistory } from 'vue-router'

import Home from './tripViews/Home.vue'
import Charge from './tripViews/Charge.vue'
import Drive from './tripViews/Drive.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/charge',
    name: 'Charge',
    component: Charge
  },
  {
    path: '/drive',
    name: 'Drive',
    component: Drive
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (window._hmt) {
    if (to.path) {
      window._hmt.push(['_trackPageview', '/trip.html#' + to.fullPath])
    }
  }
  next()
})

export default router