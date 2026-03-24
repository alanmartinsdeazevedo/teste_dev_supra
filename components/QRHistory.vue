<template>
  <section class="card history">
    <div class="hdr">
      <h2>Histórico <span v-if="store.history.length" class="badge">{{ store.history.length }}</span></h2>
      <button v-if="store.history.length" class="btn-clear" title="Limpar" @click="store.clearHistory" >
        <Icon name="tabler:trash" />
      </button>
    </div>

    <div v-if="store.history.length" class="filters">
      <div class="search-row">
        <div class="search-wrap">
          <Icon name="tabler:search" class="search-ico" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar no histórico..."
            class="search-input"
          />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
            <Icon name="tabler:x" />
          </button>
        </div>
        <button
          :class="['filter-toggle', { active: showFilters, filtering: filterType !== 'all' }]"
          title="Filtrar por tipo"
          @click="showFilters = !showFilters"
        >
          <Icon name="tabler:filter" />
        </button>
      </div>

      <Transition name="fields">
        <div v-if="showFilters" class="type-filters">
          <button
            :class="['filter-btn', { active: filterType === 'all' }]"
            @click="filterType = 'all'"
          >
            Todos
          </button>
          <button
            v-for="t in availableTypes"
            :key="t.type"
            :class="['filter-btn', { active: filterType === t.type }]"
            :title="t.label"
            @click="filterType = t.type"
          >
            <Icon :name="t.icon" class="filter-icon" />
            <span>{{ t.label }}</span>
          </button>
        </div>
      </Transition>
    </div>

    <div v-if="store.history.length && filteredHistory.length" class="list">
      <TransitionGroup name="list" tag="div">
        <div
          v-for="item in filteredHistory"
          :key="item.id"
          :class="['item', { active: selectedId === item.id }]"
          @click="handleLoad(item)"
        >
          <div class="thumb">
            <img :src="item.url" width="32" height="32" alt="" loading="lazy" />
          </div>
          <div class="info">
            <p class="text">{{ item.text }}</p>
            <span class="meta">
              <span v-if="item.templateType" class="type-tag">{{ typeLabels[item.templateType] || item.templateType }}</span>
              {{ item.size }} · {{ item.format.toUpperCase() }}
            </span>
          </div>
          <button class="btn-rm" title="Remover" @click.stop="handleRemove(item.id)">
            <Icon name="tabler:x" />
          </button>
        </div>
      </TransitionGroup>
    </div>

    <div v-else-if="store.history.length && !filteredHistory.length" class="empty">
      <Icon name="tabler:search-off" class="empty-ico" />
      <p>Nenhum resultado encontrado</p>
    </div>

    <div v-else class="empty">
      <Icon name="tabler:history-off" class="empty-ico" />
      <p>Nenhum QR Code gerado</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQRStore } from '@/stores/qrStore'
import type { QRHistoryItem } from '@/stores/qrStore'

const props = defineProps<{ activeId?: string }>()
const store = useQRStore()
const selectedId = ref<string | null>(null)

watch(() => props.activeId, (id) => {
  if (id) selectedId.value = id
})
const searchQuery = ref('')
const filterType = ref('all')
const showFilters = ref(false)

const emit = defineEmits<{ load: [item: QRHistoryItem] }>()

const typeLabels: Record<string, string> = {
  text: 'Texto',
  url: 'URL',
  wifi: 'Wi-Fi',
  email: 'E-mail',
  phone: 'Telefone',
  vcard: 'Contato'
}

const typeIcons: Record<string, string> = {
  text: 'tabler:text-size',
  url: 'tabler:link',
  wifi: 'tabler:wifi',
  email: 'tabler:mail',
  phone: 'tabler:phone',
  vcard: 'tabler:address-book'
}

const availableTypes = computed(() => {
  const types = new Set(store.history.map(h => h.templateType).filter(Boolean))
  return Array.from(types).map(type => ({
    type: type!,
    label: typeLabels[type!] || type!,
    icon: typeIcons[type!] || 'tabler:qrcode'
  }))
})

const filteredHistory = computed(() => {
  let items = store.history

  if (filterType.value !== 'all') {
    items = items.filter(item => item.templateType === filterType.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    items = items.filter(item =>
      item.text.toLowerCase().includes(query) ||
      item.id.slice(-8).includes(query)
    )
  }

  return items
})

const handleLoad = (item: QRHistoryItem) => {
  selectedId.value = item.id
  store.loadFromHistory(item)
  emit('load', item)
}

const handleRemove = (id: string) => {
  if (selectedId.value === id) selectedId.value = null
  store.removeFromHistory(id)
}
</script>

<style scoped>
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--secondary);
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge {
  background: var(--secondary);
  color: white;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.btn-clear {
  width: 28px;
  height: 28px;
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

.btn-clear:hover {
  border-color: var(--danger);
  color: var(--danger);
}

/* Filtros */
.filters {
  margin-bottom: 10px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

.search-ico {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 7px 28px 7px 28px;
  border: 1px solid var(--border);
  border-radius: 7px;
  font-size: 12px;
  font-family: var(--font);
  background: var(--surface);
  color: var(--text);
  transition: border-color 0.15s;
}

.search-input::placeholder { color: var(--text-tertiary); }
.search-input:focus { outline: none; border-color: var(--secondary); }

.search-clear {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.search-clear:hover { color: var(--text); background: var(--surface-alt); }

.filter-toggle {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.filter-toggle:hover {
  color: var(--text-secondary);
  background: var(--surface-alt);
}

.filter-toggle.active,
.filter-toggle.filtering {
  color: var(--primary);
  background: transparent;
}

.type-filters {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--surface);
  font-size: 10px;
  font-weight: 500;
  font-family: var(--font);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: var(--border-hover);
  color: var(--text-secondary);
}

.filter-btn.active {
  border-color: var(--primary);
  background: #fff7f5;
  color: var(--primary);
}

.filter-icon { font-size: 12px; }

/* List */
.list {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  cursor: pointer;
  border-radius: 7px;
  transition: background 0.1s;
  margin-bottom: 1px;
}

.item:hover { background: var(--surface-alt); }

.item.active {
  background: #fde8e0;
}

.thumb {
  width: 32px;
  height: 32px;
  border-radius: 5px;
  overflow: hidden;
  background: white;
  border: 1px solid var(--border);
  flex-shrink: 0;
  padding: 1px;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.info { flex: 1; min-width: 0; }

.text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
}

.meta {
  font-size: 10px;
  color: var(--text-tertiary);
  font-family: var(--mono);
  display: flex;
  align-items: center;
  gap: 4px;
}

.type-tag {
  font-size: 9px;
  font-weight: 600;
  font-family: var(--font);
  color: var(--primary);
  background: #fff7f5;
  padding: 0 4px;
  border-radius: 3px;
}

.btn-rm {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
  flex-shrink: 0;
  opacity: 0;
}

.item:hover .btn-rm { opacity: 1; }
.btn-rm:hover { background: #fef2f2; color: var(--danger); }

.empty {
  text-align: center;
  padding: 28px 10px;
}

.empty-ico {
  font-size: 28px;
  color: var(--border);
  margin-bottom: 8px;
}

.empty p {
  margin: 0;
  font-size: 12px;
  color: var(--text-tertiary);
}

/* Transitions */
.list-enter-active { transition: all 0.2s ease; }
.list-leave-active { transition: all 0.15s ease; }
.list-enter-from { opacity: 0; transform: translateX(-8px); }
.list-leave-to { opacity: 0; transform: translateX(8px); }
.list-move { transition: transform 0.2s ease; }
</style>
