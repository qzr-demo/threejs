import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw,
} from 'vue-router'

import Home from '@/views/Home/index.vue'
import Other from '@/views/Other/index.vue'
import Periodictable from '@/views/Periodictable/index.vue'
import Fps from '@/views/Fps/index.vue'
import VideoBox from '@/views/VideoBox/index.vue'
import UtilsPage from '@/views/UtilsPage/index.vue'
import Geometry from '@/views/Geometry/index.vue'
import FirstPerson from '@/views/FirstPerson/index.vue'

import beforeEach from './guard/beforeEach'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/:catchAll(.*)',
    component: Home,
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/other',
    name: 'Other',
    component: Other,
    meta: {
      keepAlive: false
    }
  },
  {
    path: '/periodictable',
    name: 'Periodictable',
    component: Periodictable,
    meta: {
      keepAlive: false
    }
  },
  {
    path: '/fps',
    name: 'Fps',
    component: Fps,
    meta: {
      keepAlive: false
    }
  },
  {
    path: '/videoBox',
    name: 'VideoBox',
    component: VideoBox,
    meta: {
      keepAlive: false
    }
  },
  {
    path: '/utilsPage',
    name: 'UtilsPage',
    component: UtilsPage,
    meta: {
      keepAlive: false
    }
  },
  {
    path: '/geometry',
    name: 'Geometry',
    component: Geometry,
    meta: {
      keepAlive: false
    }
  },
  {
    path: '/firstPerson',
    name: 'FirstPerson',
    component: FirstPerson,
    meta: {
      keepAlive: false
    }
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(beforeEach)

export default router
