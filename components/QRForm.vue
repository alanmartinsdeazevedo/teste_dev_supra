<template>
  <section class="card settings">
    <h2>Configurações</h2>

    <div class="form-group">
      <label>Tipo</label>
      <div class="template-grid">
        <button
          v-for="tpl in templates"
          :key="tpl.type"
          :class="['tpl-btn', { active: selectedType === tpl.type }]"
          :title="tpl.description"
          @click="selectTemplate(tpl.type)"
        >
          <Icon :name="templateIcons[tpl.type]" class="tpl-icon" />
          <span>{{ tpl.label }}</span>
        </button>
      </div>
    </div>

    <Transition name="fields" mode="out-in">
      <div :key="selectedType">
        <div v-for="field in currentTemplate.fields" :key="field.key" class="form-group">
          <label :for="`qr-${field.key}`">{{ field.label }}<span v-if="field.required" class="req">*</span></label>
          <select
            v-if="field.type === 'select'"
            :id="`qr-${field.key}`"
            v-model="fieldValues[field.key]"
            @change="updateText"
          >
            <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <input
            v-else
            :id="`qr-${field.key}`"
            v-model="fieldValues[field.key]"
            :placeholder="field.placeholder"
            @input="updateText"
            @keyup.enter="handleGenerate"
          />
        </div>
      </div>
    </Transition>

    <div v-if="store.currentConfig.text" class="raw-toggle" @click="showRawText = !showRawText">
      <Icon name="tabler:code" />
      <span>Dados gerados</span>
      <Icon :name="showRawText ? 'tabler:chevron-up' : 'tabler:chevron-down'" class="chevron" />
    </div>
    <Transition name="fields">
      <pre v-if="showRawText && store.currentConfig.text" class="raw-text">{{ store.currentConfig.text }}</pre>
    </Transition>

    <div class="adv-toggle" @click="toggleAdvanced">
      <Icon name="tabler:adjustments-horizontal" />
      <span>Personalizar</span>
      <span class="adv-summary">{{ store.currentConfig.size }} · {{ store.currentConfig.format.toUpperCase() }}</span>
      <Icon :name="showAdvanced ? 'tabler:chevron-up' : 'tabler:chevron-down'" class="chevron" />
    </div>

    <Transition name="fields">
      <div v-if="showAdvanced" class="adv-panel">
        <div class="row">
          <div class="form-group">
            <label for="qr-size">Tamanho</label>
            <select id="qr-size" v-model="store.currentConfig.size">
              <option value="150x150">150×150</option>
              <option value="200x200">200×200</option>
              <option value="300x300">300×300</option>
              <option value="400x400">400×400</option>
              <option value="500x500">500×500</option>
            </select>
          </div>
          <div class="form-group">
            <label for="qr-format">Formato</label>
            <select id="qr-format" v-model="store.currentConfig.format">
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="svg">SVG</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="form-group">
            <label>Cor</label>
            <ColorPicker v-model="store.currentConfig.color" />
          </div>
          <div class="form-group">
            <label>Fundo</label>
            <ColorPicker v-model="store.currentConfig.bgcolor" />
          </div>
        </div>
      </div>
    </Transition>

    <button class="btn-gen" :disabled="loading" @click="handleGenerate">
      <Icon :name="loading ? 'tabler:loader-2' : 'tabler:sparkles'" :class="{ spin: loading }" />
      {{ loading ? 'Gerando...' : 'Gerar' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useQRStore } from '@/stores/qrStore'
import { useQRTemplates } from '@/composables/useQRTemplates'
import type { TemplateType } from '@/composables/useQRTemplates'

defineProps<{ loading: boolean }>()
const emit = defineEmits<{ generate: [templateType: string] }>()

const store = useQRStore()
const { getTemplate, getAllTemplates } = useQRTemplates()

const templates = getAllTemplates()
const selectedType = ref<TemplateType>('text')
const currentTemplate = ref(getTemplate('text'))
const fieldValues = reactive<Record<string, string>>({})
const showRawText = ref(false)
const showAdvanced = ref(false)

if (import.meta.client) {
  showAdvanced.value = localStorage.getItem('qr_show_advanced') === 'true'
}

const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
  if (import.meta.client) {
    localStorage.setItem('qr_show_advanced', String(showAdvanced.value))
  }
}

const templateIcons: Record<TemplateType, string> = {
  text: 'tabler:text-size',
  url: 'tabler:link',
  wifi: 'tabler:wifi',
  email: 'tabler:mail',
  phone: 'tabler:phone',
  vcard: 'tabler:address-book'
}

const initFields = () => {
  currentTemplate.value.fields.forEach(field => {
    if (!(field.key in fieldValues)) {
      if (field.type === 'select' && field.options) {
        fieldValues[field.key] = field.options[0]?.value ?? ''
      } else {
        fieldValues[field.key] = ''
      }
    }
  })
}

const selectTemplate = (type: TemplateType) => {
  selectedType.value = type
  currentTemplate.value = getTemplate(type)
  Object.keys(fieldValues).forEach(key => { fieldValues[key] = '' })
  initFields()
  updateText()
}

const updateText = () => {
  store.currentConfig.text = currentTemplate.value.format(fieldValues)
}

const handleGenerate = () => {
  const requiredFields = currentTemplate.value.fields.filter(f => f.required)
  const emptyRequired = requiredFields.filter(f => !fieldValues[f.key]?.trim())

  if (emptyRequired.length) {
    const names = emptyRequired.map(f => f.label).join(', ')
    store.showNotification('error', `Preencha o campo obrigatório: ${names}`)
    return
  }

  emit('generate', selectedType.value)
}

initFields()

watch(() => store.currentConfig.text, (newText) => {
  if (!newText) {
    Object.keys(fieldValues).forEach(key => { fieldValues[key] = '' })
    return
  }
  if (newText.startsWith('WIFI:')) selectTemplateFromContent('wifi', newText)
  else if (newText.startsWith('mailto:')) selectTemplateFromContent('email', newText)
  else if (newText.startsWith('tel:')) selectTemplateFromContent('phone', newText)
  else if (newText.startsWith('BEGIN:VCARD')) selectTemplateFromContent('vcard', newText)
  else if (newText.startsWith('http://') || newText.startsWith('https://')) selectTemplateFromContent('url', newText)
  else selectTemplateFromContent('text', newText)
})

const selectTemplateFromContent = (type: TemplateType, content: string) => {
  if (selectedType.value !== type) {
    selectedType.value = type
    currentTemplate.value = getTemplate(type)
    Object.keys(fieldValues).forEach(key => { fieldValues[key] = '' })
    initFields()
  }
  parseContent(type, content)
}

const parseContent = (type: TemplateType, content: string) => {
  switch (type) {
    case 'url': fieldValues.url = content; 
    break

    case 'wifi': {
      const s = content.match(/S:([^;]*)/)
      const p = content.match(/P:([^;]*)/)
      const t = content.match(/T:([^;]*)/)
      if (s) fieldValues.ssid = s[1] ?? ''
      if (p) fieldValues.password = p[1] ?? ''
      if (t) fieldValues.encryption = t[1] ?? ''

      break
    }

    case 'email': {
      const e = content.match(/mailto:([^?]*)/)
      const s = content.match(/subject=([^&]*)/)
      const b = content.match(/body=([^&]*)/)
      if (e) fieldValues.address = e[1] ?? ''
      if (s) fieldValues.subject = decodeURIComponent(s[1] ?? '')
      if (b) fieldValues.body = decodeURIComponent(b[1] ?? '')

      break
    }
    case 'phone': fieldValues.phone = content.replace('tel:', ''); 
    break

    case 'vcard': {
      const fn = content.match(/FN:(.*)/)
      const tel = content.match(/TEL:(.*)/)
      const em = content.match(/EMAIL:(.*)/)
      const org = content.match(/ORG:(.*)/)
      const ti = content.match(/TITLE:(.*)/)
      if (fn) fieldValues.name = fn[1] ?? ''
      if (tel) fieldValues.phone = tel[1] ?? ''
      if (em) fieldValues.email = em[1] ?? ''
      if (org) fieldValues.org = org[1] ?? ''
      if (ti) fieldValues.title = ti[1] ?? ''

      break
    }
    
    default: fieldValues.text = content
  }
}
</script>

<style scoped>
h2 {
  margin: 0 0 16px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--secondary);
  letter-spacing: -0.02em;
}

.form-group { margin-bottom: 12px; }

label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 12px;
  color: var(--text-secondary);
}

.req { color: var(--primary); margin-left: 2px; }

input[type="text"],
input:not([type]),
select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  font-size: 13px;
  font-family: var(--font);
  background: var(--surface);
  color: var(--text);
  transition: border-color 0.15s;
}

input::placeholder { color: var(--text-tertiary); }
input:focus, select:focus { outline: none; border-color: var(--secondary); }

select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239ca3af' viewBox='0 0 16 16'%3E%3Cpath d='m4.5 6 3.5 3.5L11.5 6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;
}

/* Templates */
.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.tpl-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 4px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--font);
}

.tpl-btn:hover { border-color: var(--border-hover); background: var(--surface-alt); }

.tpl-btn.active {
  border-color: var(--primary);
  background: #fff7f5;
}

.tpl-icon { font-size: 24px; color: var(--text-secondary); }
.tpl-btn.active .tpl-icon { color: var(--primary); }

.tpl-btn span {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
}

.tpl-btn.active span { color: var(--primary); }

/* Raw text */
.raw-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
  cursor: pointer;
  margin-bottom: 6px;
  user-select: none;
}

.chevron { margin-left: auto; font-size: 14px; }

.raw-text {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 11px;
  font-family: var(--mono);
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0 0 8px;
  max-height: 80px;
  overflow-y: auto;
}

/* Painel avançado */
.adv-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 10px;
  transition: all 0.15s;
  user-select: none;
}

.adv-toggle:hover {
  border-color: var(--border-hover);
  background: var(--surface-alt);
}

.adv-summary {
  margin-left: auto;
  font-size: 11px;
  font-family: var(--mono);
  color: var(--text-tertiary);
}

.adv-panel {
  padding: 10px 0 2px;
}

.row { display: flex; gap: 8px; flex-wrap: wrap; }
.row .form-group { flex: 1; min-width: 100px; }


.btn-gen {
  width: 100%;
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  font-family: var(--font);
  transition: background 0.15s;
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-gen:hover:not(:disabled) { background: var(--primary-hover); }
.btn-gen:disabled { opacity: 0.5; cursor: not-allowed; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.fields-enter-active, .fields-leave-active { transition: all 0.15s ease; }
.fields-enter-from, .fields-leave-to { opacity: 0; transform: translateY(4px); }
</style>
