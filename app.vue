<template>
  <main class="app-container">
    <AppNotification />
    <div class="entrance entrance-0">
      <AppHeader />
    </div>

    <div class="main-grid">
      <div class="studio-card entrance entrance-1">
        <QRForm :loading="loading" @generate="handleGenerate($event)" />
        <div ref="previewRef" style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
          <QRPreview :url="generatedUrl" :loading="loading" :item-id="currentId" @download="downloadQR" @error="handleImageError" @clear="handleClear" @loaded="scrollToPreview" />
        </div>
      </div>
      <div class="entrance entrance-2">
        <QRHistory :active-id="currentId" @load="handleLoadFromHistory" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQRStore } from '@/stores/qrStore'
import { useQRActions } from '@/composables/useQRActions'

const previewRef = ref<HTMLElement | null>(null)

const store = useQRStore()
const {
  generatedUrl,
  loading,
  currentId,
  handleGenerate,
  handleLoadFromHistory,
  handleClear,
  handleImageError,
  downloadQR
} = useQRActions()

onMounted(() => {
  store.loadHistory()
})

const scrollToPreview = () => {
  if (!import.meta.client || window.innerWidth > 640) return
  previewRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  grid-template-columns: 1fr minmax(0, 290px);
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

.card.history {
  position: sticky;
  top: 16px;
}

.studio-card {
  display: flex;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  min-width: 0;
}

.studio-card .settings {
  width: 330px;
  flex-shrink: 0;
  padding: 20px;
  border-right: 1px solid var(--border);
}

.studio-card .preview {
  flex: 1;
  padding: 20px;
  min-width: 0;
  background: var(--surface-alt);
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .main-grid { grid-template-columns: 1fr; }
  .card.history { position: static; grid-column: 1; }
}

@media (max-width: 640px) {
  .app-container { padding: 12px; }
  .studio-card { flex-direction: column; }
  .studio-card .settings {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .studio-card .preview {
    min-height: 260px;
  }
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
</style>
