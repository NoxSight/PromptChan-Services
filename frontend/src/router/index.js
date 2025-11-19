import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import CreatePromptView from '../views/CreatePromptView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import PromptDetailView from '../views/PromptDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false }
    },
    {
      path: '/create',
      name: 'create',
      component: CreatePromptView,
      meta: { requiresAuth: true }
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/prompt/:id',
      name: 'prompt',
      component: PromptDetailView,
      meta: { requiresAuth: true },
      props: true
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: () => import('../views/EditPromptView.vue'),
      meta: { requiresAuth: true },
      props: true
    }
  ]
})

export default router