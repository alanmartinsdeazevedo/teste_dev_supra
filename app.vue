<template>
  <main class="app-container">
    <AppNotification />
    <div class="entrance entrance-0">
      <AppHeader />
    </div>

    <div class="main-grid">
      <div class="entrance entrance-1">
        <QRForm :loading="loading" @generate="handleGenerate($event)" />
      </div>
      <div ref="previewRef" class="entrance entrance-2">
        <QRPreview :url="generatedUrl" :loading="loading" :item-id="currentId" @download="downloadQR" @error="handleImageError" @clear="handleClear" />
      </div>
      <div class="entrance entrance-3">
        <QRHistory :active-id="currentId" @load="handleLoadFromHistory" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQRStore } from '@/stores/qrStore'
import { useQRCode } from '@/composables/useQRCode'
import type { QRHistoryItem } from '@/stores/qrStore'
const previewRef = ref<HTMLElement | null>(null)

const scrollToPreview = () => {
  if (!import.meta.client || window.innerWidth > 640) return
  setTimeout(() => {
    previewRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 1000)
}

const store = useQRStore()
const { generateUrl } = useQRCode()
const generatedUrl = ref('')
const loading = ref(false)
const currentId = ref('')

onMounted(() => {
  store.loadHistory()
})

const handleGenerate = (templateType: string = 'text') => {
  if (!store.currentConfig.text.trim()) {
    store.showNotification('error', 'Por favor, insira um texto ou URL.')
    return
  }

  loading.value = true
  const url = generateUrl(store.currentConfig)
  generatedUrl.value = url

  const img = new Image()
  img.onload = () => {
    loading.value = false
    const id = Date.now().toString()
    currentId.value = id
    const isDuplicate = store.saveToHistory({
      ...store.currentConfig,
      id,
      url,
      timestamp: Date.now(),
      templateType
    })
    store.showNotification(isDuplicate ? 'info' : 'success', isDuplicate ? 'QR Code já existente' : 'QR Code salvo!')
    scrollToPreview()
  }
  img.onerror = () => {
    loading.value = false
    generatedUrl.value = ''
    store.showNotification('error', 'Erro ao gerar o QR Code. Verifique os parâmetros e tente novamente.')
  }
  img.src = url
}

const handleLoadFromHistory = (item: QRHistoryItem) => {
  generatedUrl.value = item.url
  currentId.value = item.id
}

const handleClear = () => {
  generatedUrl.value = ''
  currentId.value = ''
}

const handleImageError = () => {
  store.showNotification('error', 'Erro ao carregar a imagem do QR Code.')
}

const downloadQR = async () => {
  try {
    const response = await fetch(generatedUrl.value)
    if (!response.ok) throw new Error('Falha no download')
    const blob = await response.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `qrcode-${Date.now()}.${store.currentConfig.format}`
    link.click()
    URL.revokeObjectURL(link.href)
    store.showNotification('success', 'Download iniciado!')
  } catch {
    store.showNotification('error', 'Erro ao baixar a imagem. Tente novamente.')
  }
}
</script>

<style>
:root {
  --primary: #FA4616;
  --primary-hover: #e03d12;
  --secondary: #012D3D;
  --surface: #ffffff;
  --surface-alt: #f8f9fa;
  --border: #e5e7eb;
  --border-hover: #d1d5db;
  --text: #1a1a1a;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --bg: #f1f3f5;
  --danger: #dc2626;
  --success: #16a34a;
  --font: 'DM Sans', system-ui, sans-serif;
  --mono: 'JetBrains Mono', monospace;
  --radius: 10px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
}

*, *::before, *::after { box-sizing: border-box; }

html, body {
  overflow-x: hidden;
}

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

.app-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 20px;
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 330px) 1fr minmax(0, 290px);
  gap: 16px;
  align-items: start;
}

.main-grid > * {
  min-width: 0;
}

.card {
  background: var(--surface);
  padding: 20px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  min-width: 0;
}

.card.settings,
.card.preview,
.card.history {
  position: sticky;
  top: 16px;
}

@media (max-width: 1024px) {
  .main-grid { grid-template-columns: 1fr 1fr; }
  .card.history { grid-column: 1 / -1; }
}

@media (max-width: 640px) {
  .main-grid { grid-template-columns: 1fr; }
  .app-container { padding: 12px; }
  .card.settings, .card.preview, .card.history { position: static; }
}

/* Entrance animation */
@keyframes entrance {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.entrance {
  animation: entrance 0.4s ease-out both;
}

.entrance-0 { animation-delay: 0s; }
.entrance-1 { animation-delay: 0.08s; }
.entrance-2 { animation-delay: 0.16s; }
.entrance-3 { animation-delay: 0.24s; }
</style>
