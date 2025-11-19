<template>
  <div class="create-container">
    <div class="create-card">
      <div class="create-header">
        <h1>Create New Prompt</h1>
        <p>Share your AI prompt template with the community</p>
      </div>

      <form @submit.prevent="createPrompt" class="create-form">
        <div class="form-group">
          <label for="title">Title *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="e.g., Code Review Assistant"
            required
            maxlength="200"
          />
        </div>

        <div class="form-group">
          <label for="short_description">Short Description *</label>
          <textarea
            id="short_description"
            v-model="form.short_description"
            placeholder="Brief description (10-500 characters)"
            rows="3"
            required
            maxlength="500"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="long_description">Long Description</label>
          <textarea
            id="long_description"
            v-model="form.long_description"
            placeholder="Detailed description (optional)"
            rows="4"
            maxlength="5000"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="template">Prompt Template *</label>
          <textarea
            id="template"
            v-model="form.template"
            placeholder="You are an expert {{role}}. {{input_fields}}"
            rows="8"
            required
          ></textarea>
          <small>Use <code>{{variable_name}}</code> for user inputs</small>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="tags">Tags</label>
            <input
              id="tags"
              v-model="form.tags"
              type="text"
              placeholder="code,review,ai,development"
            />
            <small>Comma-separated tags</small>
          </div>
          
          <div class="form-group">
            <label for="visibility">Visibility</label>
            <select id="visibility" v-model="form.visibility">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div class="inputs-section">
          <div class="inputs-header">
            <h3>Input Fields</h3>
            <p>Define inputs that users will fill when using your prompt</p>
          </div>
          
          <div v-if="form.inputs.length === 0" class="empty-inputs">
            <p>No input fields. Add one below to create dynamic prompts.</p>
          </div>
          
          <div v-for="(input, index) in form.inputs" :key="index" class="input-field-group">
            <div class="input-field-card">
              <div class="input-field-rows">
                <div class="form-row">
                  <div class="form-group">
                    <label>Name</label>
                    <input
                      v-model="input.name"
                      type="text"
                      placeholder="e.g., code"
                    />
                  </div>
                  <div class="form-group">
                    <label>Type</label>
                    <select v-model="input.type">
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="number">Number</option>
                      <option value="select">Select</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>Description</label>
                    <input
                      v-model="input.description"
                      type="text"
                      placeholder="e.g., The code you want reviewed"
                    />
                  </div>
                  <div class="form-group">
                    <label>Label</label>
                    <input
                      v-model="input.label"
                      type="text"
                      placeholder="e.g., Code to Review"
                    />
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>Placeholder</label>
                    <input
                      v-model="input.placeholder"
                      type="text"
                      placeholder="e.g., Paste your code here..."
                    />
                  </div>
                  <div class="form-group checkbox-group">
                    <label>Required</label>
                    <input v-model="input.required" type="checkbox" />
                  </div>
                </div>
              </div>
              
              <div v-if="input.type === 'select'" class="select-options-section">
                <label>Options</label>
                <div v-for="(option, optIndex) in input.options" :key="optIndex" class="option-row">
                  <div class="form-row">
                    <div class="form-group">
                      <input
                        v-model="option.label"
                        type="text"
                        placeholder="Label"
                      />
                    </div>
                    <div class="form-group">
                      <input
                        v-model="option.value"
                        type="text"
                        placeholder="Value"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="removeOption(input, optIndex)"
                    class="btn btn-danger btn-option-remove"
                  >
                    <i class="icon-trash"></i>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addOption(input)"
                  class="btn btn-success btn-add-option"
                >
                  <i class="icon-plus"></i> Add Option
                </button>
              </div>
              
              <button type="button" @click="removeInput(index)" class="btn btn-danger btn-small">
                <i class="icon-trash"></i> Remove
              </button>
            </div>
          </div>

          <button type="button" @click="addInput" class="btn btn-secondary btn-add">
            <i class="icon-plus"></i> Add Input Field
          </button>
        </div>

        <div class="form-actions">
          <router-link to="/" class="btn btn-outline">Cancel</router-link>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Prompt' }}
          </button>
        </div>
      </form>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const form = ref({
  title: '',
  short_description: '',
  long_description: '',
  template: '',
  tags: '',
  visibility: 'public',
  inputs: []
})

const loading = ref(false)
const error = ref('')

const addInput = () => {
  form.value.inputs.push({
    name: '',
    type: 'text',
    label: '',
    description: '',
    placeholder: '',
    required: true,
    options: []
  })
}

const addOption = (input) => {
  input.options.push({ label: '', value: '' })
}

const removeOption = (input, index) => {
  input.options.splice(index, 1)
}

const removeInput = (index) => {
  form.value.inputs.splice(index, 1)
}

const createPrompt = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await axios.post('/api/prompts', form.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    
    router.push(`/prompt/${response.data.id}`)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create prompt'
  } finally {
    loading.value = false
  }
}

addInput() // Add one input field by default
</script>

<style scoped>
.create-container {
  min-height: 100vh;
  padding: 2rem;
  background: #f8fafc;
}

.create-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  max-width: 900px;
  margin: 0 auto;
}

.create-header {
  text-align: center;
  margin-bottom: 3rem;
}

.create-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.create-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 1rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s;
  background: white;
  font-family: inherit;
}

.input-main-fields {
  margin-bottom: 1rem;
}

.input-field-card {
  position: relative;
}

.input-field-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.select-options-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.select-options-section label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  display: block;
  font-size: 0.95rem;
}

.option-row {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  position: relative;
}

.btn-option-remove {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-option-remove:hover {
  background: #dc2626;
}

.btn-add-option {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  margin-top: 0.75rem;
  width: 100%;
  border: none;
}

.remove-input-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.remove-input-btn:hover {
  background: #dc2626;
}

.select-options-section label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  display: block;
}

.option-row {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.btn-option-remove {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.btn-add-option {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  margin-top: 0.5rem;
  width: 100%;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group small {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.inputs-section {
  border: 2px solid #f3f4f6;
  border-radius: 20px;
  padding: 2.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.inputs-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.inputs-header h3 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.inputs-header p {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

.inputs-section h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.input-field-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.input-field-rows {
  flex: 1;
}

.input-field-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.empty-inputs {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-outline {
  background: transparent;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-small {
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin-top: 0.25rem;
  transform: scale(1.2);
}

.icon-trash,
.icon-plus {
  font-size: 1rem;
  width: 1em;
  height: 1em;
}

.btn-add {
  margin-top: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

code {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-family: 'Monaco', monospace;
  font-size: 0.875rem;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 12px;
  border-left: 4px solid #ef4444;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .create-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
}
</style>