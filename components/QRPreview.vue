<template>
  <section class="preview">
    <div class="hdr">
      <h2>Visualização</h2>
      <button v-if="url && !loading" class="btn-close" title="Fechar" @click="$emit('clear')">
        <Icon name="tabler:x" />
      </button>
    </div>

    <div class="preview-body">
      <Transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="state-msg">
          <div class="spinner" />
          <p>Gerando...</p>
        </div>

        <div v-else-if="url" key="preview" class="qr-display">
          <div class="qr-frame">
            <img :src="url" alt="QR Code gerado" @error="$emit('error')" />
          </div>
          <span v-if="itemId" class="item-id">#{{ itemId.slice(-8) }}</span>
          <div class="btn-row">
            <button class="btn-action" @click="copyToClipboard">
              <Icon :name="copied ? 'tabler:check' : 'tabler:copy'" />
              {{ copied ? 'Copiado!' : 'Copiar' }}
            </button>
            <button class="btn-action btn-primary" @click="$emit('download')">
              <Icon name="tabler:download" /> Baixar
            </button>
          </div>
        </div>

        <div v-else-if="previewUrl" key="live-preview" class="qr-display live-preview">
          <div class="qr-frame">
            <div v-if="!previewLoaded" class="preview-placeholder" />
            <img
              v-show="previewLoaded"
              :src="previewUrl"
              alt="Pré-visualização"
              @load="previewLoaded = true"
              @error="previewLoaded = false"
            />
          </div>
          <p class="preview-hint">
            <Icon name="tabler:eye" />
            Pré-visualização
          </p>
        </div>

        <div v-else key="empty" class="state-msg empty">
          <Icon name="tabler:qrcode" class="empty-ico" />
          <p>Configure e clique em <strong>Gerar</strong></p>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQRStore } from '@/stores/qrStore'
import { useQRCode } from '@/composables/useQRCode'

const props = defineProps<{ url: string; loading: boolean; itemId?: string }>()
defineEmits<{ download: []; error: []; clear: [] }>()

const store = useQRStore()
const { generateUrl } = useQRCode()
const copied = ref(false)
const debouncedText = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => store.currentConfig.text, (text) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedText.value = text
  }, 300)
}, { immediate: true })

const previewLoaded = ref(false)

const previewUrl = computed(() => {
  if (props.url || props.loading || !debouncedText.value.trim()) return ''
  return generateUrl({
    ...store.currentConfig,
    size: '200x200',
    format: 'png'
  })
})

watch(previewUrl, () => {
  previewLoaded.value = false
})

const copyToClipboard = async () => {
  try {
    const response = await fetch(props.url)
    const blob = await response.blob()
    const pngBlob = blob.type === 'image/png' ? blob : await convertToPng(blob)
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': pngBlob })
    ])
    copied.value = true
    store.showNotification('success', 'QR Code copiado!')
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    store.showNotification('error', 'Não foi possível copiar. Tente baixar a imagem.')
  }
}

const convertToPng = (blob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Falha na conversão')), 'image/png')
    }
    img.onerror = reject
    img.src = URL.createObjectURL(blob)
  })
}
</script>

<style scoped>
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.preview-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--secondary);
  letter-spacing: -0.02em;
}

.btn-close {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-tertiary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-close:hover {
  border-color: var(--danger);
  color: var(--danger);
}

.qr-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-frame {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  background: white;
}

.qr-frame img {
  display: block;
  max-width: 100%;
  height: auto;
}

.btn-row {
  display: flex;
  gap: 6px;
  width: 100%;
}

.btn-action {
  flex: 1;
  background: var(--surface-alt);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 9px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  font-family: var(--font);
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.btn-action:hover {
  border-color: var(--border-hover);
  background: var(--bg);
}

.btn-action.btn-primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.btn-action.btn-primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.state-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
}

.state-msg p {
  margin: 0;
  font-size: 13px;
  color: var(--text-tertiary);
  max-width: 200px;
  line-height: 1.5;
}

.state-msg strong { color: var(--primary); }

.empty-ico {
  font-size: 40px;
  color: var(--border);
  margin-bottom: 10px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.live-preview {
  opacity: 0.45;
  transition: opacity 0.3s ease;
}

.live-preview:hover {
  opacity: 0.7;
}

.live-preview .qr-frame {
  border-style: dashed;
}

.preview-placeholder {
  width: 200px;
  height: 200px;
  background: var(--surface-alt);
  border-radius: 4px;
}

.preview-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
}

.item-id {
  margin-bottom: 10px;
  font-size: 10px;
  font-family: var(--mono);
  color: var(--text-tertiary);
  letter-spacing: 0.05em;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
