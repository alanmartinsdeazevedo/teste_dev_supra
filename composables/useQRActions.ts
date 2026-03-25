import { ref, watch, nextTick } from 'vue'
import { useQRStore } from '@/stores/qrStore'
import { useQRCode } from '@/composables/useQRCode'
import type { QRHistoryItem } from '@/stores/qrStore'

export const useQRActions = () => {
  const store = useQRStore()
  const { generateUrl } = useQRCode()

  const generatedUrl = ref('')
  const loading = ref(false)
  const currentId = ref('')
  let loadingFromHistory = false

  watch(() => store.currentConfig, () => {
    if (!loadingFromHistory && generatedUrl.value) {
      generatedUrl.value = ''
      currentId.value = ''
    }
  }, { deep: true })

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
      store.showNotification(
        isDuplicate ? 'info' : 'success',
        isDuplicate ? 'QR Code já existente' : 'QR Code salvo!'
      )
    }
    img.onerror = () => {
      loading.value = false
      generatedUrl.value = ''
      store.showNotification('error', 'Erro ao gerar o QR Code. Verifique os parâmetros e tente novamente.')
    }
    img.src = url
  }

  const handleLoadFromHistory = (item: QRHistoryItem) => {
    loadingFromHistory = true
    generatedUrl.value = item.url
    currentId.value = item.id
    store.loadFromHistory(item)
    nextTick(() => { loadingFromHistory = false })
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

  return {
    generatedUrl,
    loading,
    currentId,
    handleGenerate,
    handleLoadFromHistory,
    handleClear,
    handleImageError,
    downloadQR
  }
}
