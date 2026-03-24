import type { QRConfig } from '../stores/qrStore'

const buildParams = (config: QRConfig): URLSearchParams =>
  new URLSearchParams({
    data: config.text,
    size: config.size,
    color: config.color.replace('#', ''),
    bgcolor: config.bgcolor.replace('#', ''),
    format: config.format
  })

export const useQRCode = () => {
  const generateUrl = (config: QRConfig): string =>
    `/api/qrcode?${buildParams(config).toString()}`

  const generateDirectUrl = (config: QRConfig): string =>
    `https://api.qrserver.com/v1/create-qr-code/?${buildParams(config).toString()}`

  return { generateUrl, generateDirectUrl }
}
