import { createRouter, createWebHashHistory } from 'vue-router'

import Home from './tripViews/Home.vue'
// import Charge from './views/Charge.vue'
import Drive from './tripViews/Drive.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  // {
  //   path: '/charge',
  //   name: 'Charge',
  //   component: Charge
  // },
  // {
  //   path: '/stats',
  //   name: 'Stats',
  //   component: Stats
  // },
  {
    path: '/drive',
    name: 'Drive',
    component: Drive
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})