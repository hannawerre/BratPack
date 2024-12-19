import { createRouter, createWebHistory } from 'vue-router'
import StartView from '../views/StartView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Start',
      component: StartView
    },
      {
      path: '/poll/:id',
      name: 'PollView',
      component: () => import('../views/PollView.vue')
    },
    {
      path: '/lobby/:id',
      name: 'LobbyView',
      component: () => import('../views/LobbyView.vue')
    },
    {
      path: '/create/',
      name: 'CreateView',
      component: () => import('../views/CreateView.vue')
    },
    {
      path: '/result/:id',
      name: 'ResultView',
      component: () => import('../views/ResultView.vue')
    },
    {
      path: '/edit/:gameId',
      name: 'EditView',
      component: () => import('../views/EditView.vue'),
      props: true,
    },
    {
      path: '/game/:gamePin',
      name: 'GameView',
      component: () => import('../views/GameView.vue'),
      props: true,
    },
    {
      path: '/customgames/:gamePin?',
      name: 'CustomGamesView',
      component: () => import ('../views/CustomGamesView.vue')
    }

  ]
})

export default router
