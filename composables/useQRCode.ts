import type { QRConfig } from '../stores/qrStore'

export const useQRCode = () => {
  /**
   * Gera URL do QR Code via proxy (/api/qrcode).
   */
  const generateUrl = (config: QRConfig): string => {
    const color = config.color.replace('#', '')
    const bgcolor = config.bgcolor.replace('#', '')

    const params = new URLSearchParams({
      data: config.text,
      size: config.size,
      color,
      bgcolor,
      format: config.format
    })

    return `/api/qrcode?${params.toString()}`
  }

  /**
   * Fallback (sem proxy)
   */
  const generateDirectUrl = (config: QRConfig): string => {
    const color = config.color.replace('#', '')
    const bgcolor = config.bgcolor.replace('#', '')

    const params = new URLSearchParams({
      data: config.text,
      size: config.size,
      color,
      bgcolor,
      format: config.format
    })

    return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
  }

  return { generateUrl, generateDirectUrl }
}
