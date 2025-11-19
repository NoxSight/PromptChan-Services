<template>
  <div id="app">
    <nav class="navbar" v-if="!$route.meta.requiresAuth || isAuthenticated">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">
          PromptChan
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Catalog</router-link>
          <router-link to="/favorites" class="nav-link" v-if="isAuthenticated">Favorites</router-link>
          <router-link to="/create" class="nav-link" v-if="isAuthenticated">Create</router-link>
          <template v-if="isAuthenticated">
            <span class="nav-username">{{ user?.username }}</span>
            <button @click="logout" class="nav-btn logout">Logout</button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-btn">Login</router-link>
            <router-link to="/register" class="nav-btn primary">Register</router-link>
          </template>
        </div>
      </div>
    </nav>

    <router-view />

    <footer class="footer">
      <p>&copy; 2025 PromptChan. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isAuthenticated = ref(false)
const user = ref(null)

const token = computed(() => localStorage.getItem('token'))
const userData = computed(() => localStorage.getItem('user'))

onMounted(() => {
  if (token.value) {
    isAuthenticated.value = true
    try {
      user.value = JSON.parse(userData.value)
    } catch {
      user.value = null
    }
  }
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  isAuthenticated.value = false
  user.value = null
  router.push('/')
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.8rem;
  font-weight: bold;
  text-decoration: none;
  color: white;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: rgba(255,255,255,0.1);
}

.nav-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn.primary {
  background: #10b981;
  color: white;
}

.nav-btn:hover {
  transform: translateY(-1px);
}

.nav-username {
  color: rgba(255,255,255,0.9);
  font-weight: 500;
}

.logout {
  background: rgba(255,255,255,0.1);
  color: white;
}

.footer {
  margin-top: auto;
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}
</style>