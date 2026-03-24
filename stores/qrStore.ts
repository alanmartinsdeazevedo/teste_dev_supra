import { defineStore } from 'pinia'

export type NotificationType = 'success' | 'error' | 'info'

export interface QRConfig {
  text: string
  size: string
  color: string
  bgcolor: string
  format: string
}

export interface QRHistoryItem extends QRConfig {
  id: string
  url: string
  timestamp: number
  templateType?: string
}

export const useQRStore = defineStore('qrStore', {
  state: () => ({
    history: [] as QRHistoryItem[],
    currentConfig: {
      text: '',
      size: '300x300',
      color: '#000000',
      bgcolor: '#ffffff',
      format: 'png'
    } as QRConfig,
    notification: null as { type: NotificationType; message: string } | null
  }),
  actions: {
    saveToHistory(item: QRHistoryItem): boolean {
      const existingIndex = this.history.findIndex(
        (h) => h.text === item.text && h.size === item.size && h.color === item.color && h.bgcolor === item.bgcolor && h.format === item.format
      )
      const isDuplicate = existingIndex !== -1
      if (isDuplicate) {
        this.history.splice(existingIndex, 1)
      }
      this.history = [item, ...this.history]
      if (import.meta.client) {
        localStorage.setItem('qr_history', JSON.stringify(this.history))
      }
      return isDuplicate
    },
    
    loadHistory() {
      if (import.meta.client) {
        const saved = localStorage.getItem('qr_history')
        if (saved) this.history = JSON.parse(saved)
      }
    },

    loadFromHistory(item: QRHistoryItem) {
      this.currentConfig = {
        text: item.text,
        size: item.size,
        color: item.color,
        bgcolor: item.bgcolor,
        format: item.format
      }
    },

    showNotification(type: NotificationType, message: string) {
      this.notification = { type, message }
      setTimeout(() => {
        this.notification = null
      }, 3000)
    },
    clearNotification() {
      this.notification = null
    },

    removeFromHistory(id: string) {
      this.history = this.history.filter(h => h.id !== id)
      if (import.meta.client) {
        localStorage.setItem('qr_history', JSON.stringify(this.history))
      }
      this.showNotification('success', 'QR Code removido.')
    },

    clearHistory() {
      this.history = []
      if (import.meta.client) {
        localStorage.removeItem('qr_history')
      }
      this.showNotification('success', 'Histórico limpo.')
    }
  }
})
