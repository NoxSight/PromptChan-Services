<template>
  <div class="home">
    <div class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Discover & Share AI Prompts</h1>
        <p class="hero-subtitle">Browse thousands of expertly crafted prompts for ChatGPT, Claude, and more</p>
        <div class="hero-actions">
          <router-link to="/create" class="btn btn-primary" v-if="isAuthenticated">
            Create New Prompt
          </router-link>
          <button class="btn btn-primary" @click="searchPrompts" v-else>
            Browse Catalog
          </button>
          <router-link to="/favorites" class="btn btn-secondary" v-if="isAuthenticated">
            My Favorites
          </router-link>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="search-section">
        <div class="search-box">
          <input
            v-model="searchQuery"
            @keyup.enter="searchPrompts"
            placeholder="Search prompts by title, description, or tags..."
            class="search-input"
          />
          <button @click="searchPrompts" class="search-btn">
            <i class="icon-search"></i> Search
          </button>
        </div>
        
        <div class="filters">
          <select v-model="selectedTag" @change="searchPrompts" class="filter-select">
            <option value="">All Tags</option>
            <option v-for="tag in availableTags" :key="tag" :value="tag">{{ tag }}</option>
          </select>
          
          <label class="favorites-filter" v-if="isAuthenticated">
            <input type="checkbox" v-model="showOnlyFavorites" @change="applyFavoritesFilter">
            <span class="filter-text">❤️ Show only favorites</span>
          </label>
          
          <button @click="clearFilters" class="btn btn-outline">Clear Filters</button>
        </div>
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
              @click.stop="toggleFavorite(prompt)"
              :class="['favorite-btn', { favorited: prompt.isFavorited }]"
              :title="prompt.isFavorited ? 'Remove from favorites' : 'Add to favorites'"
            >
              <i :class="['icon-heart', { favorited: prompt.isFavorited }]"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No prompts found</h3>
        <p>Try adjusting your search or filters</p>
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
const searchQuery = ref('')
const selectedTag = ref('')
const availableTags = ref([])
const showOnlyFavorites = ref(false)

const isAuthenticated = computed(() => !!localStorage.getItem('token'))
const token = computed(() => localStorage.getItem('token'))

const searchPrompts = async () => {
  skip.value = 0
  await loadPrompts()
}

const loadPrompts = async () => {
  try {
    const params = {
      skip: skip.value,
      limit: limit.value,
      q: searchQuery.value || undefined,
      tags: selectedTag.value || undefined,
      favorites_only: showOnlyFavorites.value || undefined
    }

    const response = await axios.get('/api/prompts', {
      headers: isAuthenticated.value ? { Authorization: `Bearer ${token.value}` } : {},
      params
    }).catch(error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
      throw error
    })

    prompts.value = response.data.prompts
    total.value = response.data.total

    // Extract unique tags
    const tags = new Set()
    prompts.value.forEach(prompt => {
      if (prompt.tags) {
        prompt.tags.split(',').forEach(tag => tags.add(tag.trim()))
      }
    })
    availableTags.value = Array.from(tags).sort()
  } catch (error) {
    console.error('Failed to load prompts:', error)
    prompts.value = []
  }
}

const changePage = (direction) => {
  skip.value += direction * limit.value
  loadPrompts()
}

const toggleFavorite = async (prompt) => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  try {
    if (prompt.isFavorited) {
      await axios.delete(`/api/prompts/${prompt.id}/favorite`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      prompt.isFavorited = false
    } else {
      await axios.post(`/api/prompts/${prompt.id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      prompt.isFavorited = true
    }
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
    console.error('Failed to toggle favorite:', error)
  }
}

const applyFavoritesFilter = () => {
  // Trigger search with new filter
  searchPrompts()
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedTag.value = ''
  showOnlyFavorites.value = false
  searchPrompts()
}

onMounted(() => {
  loadPrompts()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.3rem;
  opacity: 0.95;
  margin-bottom: 2.5rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.search-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  align-items: end;
}

.search-box {
  flex: 1;
  min-width: 300px;
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-btn {
  padding: 1rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 1rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 1rem;
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
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
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

.icon-search,
.icon-heart {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters {
    justify-content: center;
  }
  
  .prompts-grid {
    grid-template-columns: 1fr;
  }
}

.favorites-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.favorites-filter:hover {
  border-color: #d1d5db;
}

.favorites-filter input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

.filter-text {
  font-weight: 500;
  color: #374151;
}
</style>