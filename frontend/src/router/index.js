import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
  { path: '/history', name: 'History', component: () => import('@/views/HistoryView.vue') },
]

const router = createRouter({ history: createWebHashHistory(), routes })
export default router
