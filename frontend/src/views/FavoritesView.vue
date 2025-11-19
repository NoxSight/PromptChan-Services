<template>
  <div class="favorites-container">
    <div class="container">
      <div class="page-header">
        <h1>My Favorites</h1>
        <p>Your saved prompt templates</p>
      </div>

      <div class="prompts-grid" v-if="prompts.length">
        <div
          v-for="prompt in prompts"
          :key="prompt.id"
          class="prompt-card"
          @click="$router.push(`/prompt/${prompt.id}`)"
        >
          <div class="prompt-header">
            <h3 class="prompt-title">{{ prompt.title }}</h3>
            <div class="prompt-meta">
              <span class="creator">{{ prompt.creator?.username || 'Unknown' }}</span>
              <span class="visibility" :class="prompt.visibility">{{ prompt.visibility }}</span>
            </div>
          </div>
          <p class="prompt-description">{{ prompt.short_description }}</p>
          <div class="prompt-tags">
            <span v-for="tag in prompt.tags?.split(',') || []" :key="tag" class="tag">{{ tag.trim() }}</span>
          </div>
          <div class="prompt-footer">
            <button
              @click.stop="toggleFavorite(prompt.id)"
              class="favorite-btn favorited"
              title="Remove from favorites"
            >
              <i class="icon-heart"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">❤️</div>
        <h3>No favorites yet</h3>
        <p>Save prompts by clicking the heart icon on any prompt card.</p>
        <router-link to="/" class="btn btn-primary">Browse Prompts</router-link>
      </div>

      <div v-if="total > limit" class="pagination">
        <button @click="changePage(-1)" :disabled="skip === 0" class="btn btn-outline">
          Previous
        </button>
        <span class="pagination-info">
          Page {{ Math.floor(skip / limit) + 1 }} of {{ Math.ceil(total / limit) }}
        </span>
        <button @click="changePage(1)" :disabled="skip + limit >= total" class="btn btn-outline">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const prompts = ref([])
const total = ref(0)
const skip = ref(0)
const limit = ref(12)

const isAuthenticated = computed(() => !!localStorage.getItem('token'))
const token = computed(() => localStorage.getItem('token'))

const loadPrompts = async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  try {
    const params = {
      skip: skip.value,
      limit: limit.value
    }

    const response = await axios.get('/api/prompts/favorites', {
      headers: { Authorization: `Bearer ${token.value}` },
      params
    })

    prompts.value = response.data.prompts
    total.value = response.data.total
  } catch (error) {
    console.error('Failed to load favorites:', error)
    prompts.value = []
  }
}

const changePage = (direction) => {
  skip.value += direction * limit.value
  loadPrompts()
}

const toggleFavorite = async (promptId) => {
  try {
    await axios.delete(`/api/prompts/${promptId}/favorite`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    
    // Remove from local list
    prompts.value = prompts.value.filter(p => p.id !== promptId)
    total.value = Math.max(0, total.value - 1)
  } catch (error) {
    console.error('Failed to remove favorite:', error)
  }
}

onMounted(() => {
  loadPrompts()
})
</script>

<style scoped>
.favorites-container {
  min-height: 100vh;
  background: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

.prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.prompt-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #f3f4f6;
}

.prompt-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
}

.prompt-header {
  margin-bottom: 1rem;
}

.prompt-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.prompt-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.creator {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

.visibility {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.visibility.public {
  background: #dcfce7;
  color: #166534;
}

.visibility.private {
  background: #fee2e2;
  color: #991b1b;
}

.prompt-description {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.prompt-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.prompt-footer {
  display: flex;
  justify-content: flex-end;
}

.favorite-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn:hover {
  background: #f3f4f6;
}

.favorited {
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
}

.pagination-info {
  color: #6b7280;
  font-weight: 500;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-outline:hover:not(:disabled) {
  background: #f3f4f6;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .prompts-grid {
    grid-template-columns: 1fr;
  }
  
  .container {
    padding: 2rem 1rem;
  }
}
</style>