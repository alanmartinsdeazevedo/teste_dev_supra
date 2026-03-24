import { defineEventHandler, getQuery, createError } from 'h3'

/**
 * GET /api/qrcode?data=...&size=300x300&color=000000&bgcolor=ffffff&format=png
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const data = query.data as string | undefined
  if (!data || data.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'O parâmetro "data" é obrigatório.'
    })
  }

  if (data.length > 900) {
    throw createError({
      statusCode: 400,
      statusMessage: 'O texto deve ter no máximo 900 caracteres.'
    })
  }

  const size = (query.size as string) || '300x300'
  const color = (query.color as string) || '000000'
  const bgcolor = (query.bgcolor as string) || 'ffffff'
  const format = (query.format as string) || 'png'

  const validFormats = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'eps']
  if (!validFormats.includes(format)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Formato inválido. Formatos aceitos: ${validFormats.join(', ')}`
    })
  }

  const sizePattern = /^\d+x\d+$/
  if (!sizePattern.test(size)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tamanho inválido. Use o formato NxN (ex: 300x300).'
    })
  }

  const apiUrl = new URL('https://api.qrserver.com/v1/create-qr-code/')
  apiUrl.searchParams.set('data', data)
  apiUrl.searchParams.set('size', size)
  apiUrl.searchParams.set('color', color)
  apiUrl.searchParams.set('bgcolor', bgcolor)
  apiUrl.searchParams.set('format', format)

  try {
    const response = await fetch(apiUrl.toString())

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Erro ao gerar QR Code na API externa.'
      })
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    event.node.res.setHeader('Content-Type', contentType)
    event.node.res.setHeader('Cache-Control', 'public, max-age=3600')

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 502,
      statusMessage: 'Não foi possível conectar à API do goQR.me. Verifique sua conexão.'
    })
  }
})
