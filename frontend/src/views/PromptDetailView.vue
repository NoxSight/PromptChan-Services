<template>
  <div class="prompt-detail-container">
    <div class="container">
      <div class="prompt-header">
        <div class="prompt-meta">
          <span class="creator">{{ prompt.creator?.username || 'Unknown' }}</span>
          <span class="visibility" :class="prompt.visibility">{{ prompt.visibility }}</span>
          <div class="prompt-tags">
            <span v-for="tag in prompt.tags?.split(',') || []" :key="tag" class="tag">{{ tag.trim() }}</span>
          </div>
        </div>
        <div class="prompt-actions">
          <button
            @click="toggleFavorite"
            :class="['favorite-btn', { favorited: isFavorited }]"
            :title="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
          >
            <i :class="['icon-heart', { favorited: isFavorited }]"></i>
          </button>
          <button v-if="isOwner" @click="editPrompt" class="btn btn-secondary">
            Edit
          </button>
          <button v-if="isOwner" @click="deletePrompt" class="btn btn-danger">
            Delete
          </button>
        </div>
      </div>

      <div class="prompt-content">
        <h1 class="prompt-title">{{ prompt.title }}</h1>
        <p class="prompt-short">{{ prompt.short_description }}</p>
        
        <div v-if="prompt.long_description" class="prompt-long">
          {{ prompt.long_description }}
        </div>

        <div class="template-section">
          <h3>Template</h3>
          <div class="template-code">
            {{ prompt.template }}
          </div>
        </div>

        <div v-if="prompt.inputs && prompt.inputs.length" class="inputs-section">
          <div class="use-prompt-header">
            <h3>🧪 Use this Prompt</h3>
            <p>Fill in the inputs to generate your ready-to-use prompt</p>
          </div>
    
          <div v-for="(input, index) in prompt.inputs" :key="index" class="input-field">
            <label>{{ input.label || input.name }}</label>
            <textarea
              v-if="input.type === 'textarea'"
              v-model="inputValues[input.name]"
              :placeholder="input.placeholder || `Enter ${input.name}`"
              :required="input.required"
              rows="4"
            ></textarea>
            <select
              v-else-if="input.type === 'select'"
              v-model="inputValues[input.name]"
              :required="input.required"
            >
              <option value="" disabled>{{ input.placeholder || `Select ${input.name}` }}</option>
              <option
                v-for="option in input.options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <input
              v-else
              v-model="inputValues[input.name]"
              :type="input.type"
              :placeholder="input.placeholder || `Enter ${input.name}`"
              :required="input.required"
            />
            <small v-if="input.description" class="input-description">{{ input.description }}</small>
          </div>
    
          <div class="use-prompt-actions">
            <button @click="generatePrompt" class="btn btn-primary" :disabled="usingPrompt || !isReady">
              {{ usingPrompt ? 'Generating...' : 'Generate Prompt' }}
            </button>
            <button type="button" @click="copyPrompt" class="btn btn-secondary" :disabled="!finalPrompt || usingPrompt">
              {{ copied ? 'Copied!' : 'Copy Prompt' }}
            </button>
          </div>
    
          <div v-if="finalPrompt" class="generated-prompt">
            <h4>Ready to use:</h4>
            <div class="prompt-text" ref="promptText">
              {{ finalPrompt }}
            </div>
          </div>
        </div>
      </div>


      <div class="prompt-footer">
        <p>Created: {{ new Date(prompt.created_at).toLocaleDateString() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const prompt = ref({})
const isFavorited = ref(false)
const isOwner = ref(false)
const loading = ref(true)
const usingPrompt = ref(false)
const inputValues = ref({})
const finalPrompt = ref('')
const copied = ref(false)

const token = computed(() => localStorage.getItem('token'))
const user = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return null
  }
})

const loadPrompt = async () => {
  try {
    const response = await axios.get(`/api/prompts/${route.params.id}`, {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {}
    })
    
    const data = response.data
    
    // Parse inputs if it's a string
    if (typeof data.inputs === 'string') {
      try {
        data.inputs = JSON.parse(data.inputs)
      } catch (e) {
        console.error('Failed to parse inputs:', e)
        data.inputs = []
      }
    }
    
    prompt.value = data
    isOwner.value = user.value?.id === prompt.value.creator_id
    isFavorited.value = data.isFavorited || false
  } catch (error) {
    console.error('Failed to load prompt:', error)
  } finally {
    loading.value = false
  }
}

const toggleFavorite = async () => {
  if (!token.value) {
    router.push('/login')
    return
  }

  try {
    if (isFavorited.value) {
      await axios.delete(`/api/prompts/${route.params.id}/favorite`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
    } else {
      await axios.post(`/api/prompts/${route.params.id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
    }
    isFavorited.value = !isFavorited.value
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}

const editPrompt = () => {
  router.push(`/edit/${route.params.id}`)
}

const deletePrompt = async () => {
  if (!confirm('Are you sure you want to delete this prompt?')) return

  try {
    await axios.delete(`/api/prompts/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    router.push('/')
  } catch (error) {
    console.error('Failed to delete prompt:', error)
  }
}

const isReady = computed(() => {
  return prompt.value.inputs?.every(input =>
    input.required ? !!inputValues.value[input.name] : true
  ) ?? false
})

const generatePrompt = async () => {
  usingPrompt.value = true
  try {
    let generated = prompt.value.template
    
    prompt.value.inputs.forEach(input => {
      const value = inputValues.value[input.name] || ''
      const placeholder = `{{${input.name}}}`
      generated = generated.replace(new RegExp(placeholder, 'g'), value)
    })
    
    finalPrompt.value = generated
  } finally {
    usingPrompt.value = false
  }
}

const copyPrompt = async () => {
  try {
    await navigator.clipboard.writeText(finalPrompt.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

onMounted(() => {
  loadPrompt()
})
</script>

<style scoped>
.prompt-detail-container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.prompt-meta {
  flex: 1;
}

.creator {
  display: inline-block;
  background: #f3f4f6;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.visibility {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-right: 1rem;
  margin-bottom: 1rem;
}

.visibility.public {
  background: #dcfce7;
  color: #166534;
}

.visibility.private {
  background: #fee2e2;
  color: #991b1b;
}

.prompt-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.prompt-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.prompt-content {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
}

.prompt-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.prompt-short {
  font-size: 1.3rem;
  color: #4b5563;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.prompt-long {
  background: #f8fafc;
  border-left: 4px solid #667eea;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  color: #374151;
  line-height: 1.7;
}

.template-section h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.template-code {
  background: #1f2937;
  color: #f9fafb;
  padding: 2rem;
  border-radius: 12px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  position: relative;
}

.template-code::before {
  content: '📝';
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  font-size: 1.2rem;
  opacity: 0.7;
}

.inputs-section {
  margin-top: 2.5rem;
}

.use-prompt-header {
  margin-bottom: 2rem;
}

.use-prompt-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.use-prompt-header p {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

.inputs-section h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.input-field {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
}

.input-field label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.input-field input,
.input-field textarea,
.input-field select {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
}

.input-field input:focus,
.input-field textarea:focus,
.input-field select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field textarea {
  min-height: 100px;
  line-height: 1.5;
}

.input-field small.input-description {
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: block;
  font-style: italic;
}

.input-preview label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.input-preview input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
}

.input-preview input:disabled {
  background: #f9fafb;
  color: #6b7280;
}

.input-preview .input-description {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0.25rem 0 0.75rem 0;
  font-style: italic;
}

.prompt-footer {
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
}

.favorite-btn {
  background: none;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.favorite-btn:hover {
  background: #f3f4f6;
}

.favorited {
  color: #ef4444;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.use-prompt-actions {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  justify-content: center;
}

.generated-prompt {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.generated-prompt h4 {
  margin: 0 0 1rem 0;
  color: #0369a1;
  font-weight: 600;
}

.prompt-text {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  border-left: 4px solid #0ea5e9;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.icon-heart {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .prompt-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .prompt-actions {
    justify-content: flex-start;
  }
  
  .prompt-content {
    padding: 2rem 1.5rem;
  }
  
  .prompt-title {
    font-size: 2rem;
  }
}
</style>