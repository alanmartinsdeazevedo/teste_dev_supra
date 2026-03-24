<template>
  <Transition name="notification">
    <div v-if="store.notification" :class="['notification', store.notification.type]">
      <Icon :name="store.notification.type === 'success' ? 'tabler:check' : store.notification.type === 'info' ? 'tabler:info-circle' : 'tabler:alert-triangle'" class="notification-icon" />
      <span>{{ store.notification.message }}</span>
      <button class="notification-close" @click="store.clearNotification">
        <Icon name="tabler:x" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useQRStore } from '@/stores/qrStore'
const store = useQRStore()
</script>

<style scoped>
.notification {
  position: fixed;
  top: 16px;
  right: 16px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  border: 1px solid;
}

.notification.success {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.notification.error {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.notification.info {
  background: #eff6ff;
  color: #1e40af;
  border-color: #bfdbfe;
}

.notification-icon { font-size: 16px; flex-shrink: 0; }

.notification-close {
  background: none;
  border: none;
  color: inherit;
  opacity: 0.5;
  font-size: 14px;
  cursor: pointer;
  padding: 2px;
  display: flex;
  margin-left: 4px;
}

.notification-close:hover { opacity: 1; }

.notification-enter-active,
.notification-leave-active {
  transition: all 0.25s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
