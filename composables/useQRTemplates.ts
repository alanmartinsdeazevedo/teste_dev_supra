export type TemplateType = 'text' | 'url' | 'wifi' | 'email' | 'phone' | 'vcard'

export interface TemplateField {
  key: string
  label: string
  placeholder: string
  type?: 'text' | 'select'
  options?: { value: string; label: string }[]
  required?: boolean
}

export interface QRTemplate {
  type: TemplateType
  label: string
  description: string
  fields: TemplateField[]
  format: (values: Record<string, string>) => string
}

const templates: QRTemplate[] = [
  {
    type: 'text',
    label: 'Texto Livre',
    description: 'Qualquer texto ou mensagem',
    fields: [
      { key: 'text', label: 'Texto', placeholder: 'Digite seu texto aqui...', required: true }
    ],
    format: (v) => v.text || ''
  },
  {
    type: 'url',
    label: 'URL',
    description: 'Link para website',
    fields: [
      { key: 'url', label: 'URL', placeholder: 'https://supranet.com.br', required: true }
    ],
    format: (v) => {
      const url = v.url || ''
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`
      }
      return url
    }
  },
  {
    type: 'wifi',
    label: 'Wi-Fi',
    description: 'Conexão automática à rede',
    fields: [
      { key: 'ssid', label: 'Nome da Rede (SSID)', placeholder: 'MinhaRede', required: true },
      { key: 'password', label: 'Senha', placeholder: 'senha123' },
      {
        key: 'encryption',
        label: 'Segurança',
        placeholder: '',
        type: 'select',
        options: [
          { value: 'WPA', label: 'WPA/WPA2' },
          { value: 'WEP', label: 'WEP' },
          { value: 'nopass', label: 'Sem senha' }
        ]
      }
    ],
    format: (v) => {
      const enc = v.encryption || 'WPA'
      const password = enc === 'nopass' ? '' : (v.password || '')
      return `WIFI:T:${enc};S:${v.ssid || ''};P:${password};;`
    }
  },
  {
    type: 'email',
    label: 'E-mail',
    description: 'Enviar e-mail com assunto e corpo',
    fields: [
      { key: 'address', label: 'E-mail', placeholder: 'contato@supranet.com.br', required: true },
      { key: 'subject', label: 'Assunto', placeholder: 'Assunto do e-mail' },
      { key: 'body', label: 'Mensagem', placeholder: 'Corpo do e-mail' }
    ],
    format: (v) => {
      let mailto = `mailto:${v.address || ''}`
      const params: string[] = []
      if (v.subject) params.push(`subject=${encodeURIComponent(v.subject)}`)
      if (v.body) params.push(`body=${encodeURIComponent(v.body)}`)
      if (params.length) mailto += `?${params.join('&')}`
      return mailto
    }
  },
  {
    type: 'phone',
    label: 'Telefone',
    description: 'Ligar para um número',
    fields: [
      { key: 'phone', label: 'Número', placeholder: '+55 31 99999-9999', required: true }
    ],
    format: (v) => `tel:${v.phone || ''}`
  },
  {
    type: 'vcard',
    label: 'Contato',
    description: 'Cartão de visita (vCard)',
    fields: [
      { key: 'name', label: 'Nome', placeholder: 'João Silva', required: true },
      { key: 'phone', label: 'Telefone', placeholder: '+55 11 99999-9999' },
      { key: 'email', label: 'E-mail', placeholder: 'joao@supranet.com.br' },
      { key: 'org', label: 'Empresa', placeholder: 'Supranet' },
      { key: 'title', label: 'Cargo', placeholder: 'Desenvolvedor' }
    ],
    format: (v) => {
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${v.name || ''}`,
      ]
      if (v.phone) lines.push(`TEL:${v.phone}`)
      if (v.email) lines.push(`EMAIL:${v.email}`)
      if (v.org) lines.push(`ORG:${v.org}`)
      if (v.title) lines.push(`TITLE:${v.title}`)
      lines.push('END:VCARD')
      return lines.join('\n')
    }
  }
]

export const useQRTemplates = () => {
  const getTemplate = (type: TemplateType): QRTemplate => {
    const found = templates.find(t => t.type === type)
    if (!found) {
      return templates[0] as QRTemplate
    }
    return found
  }

  const getAllTemplates = (): QRTemplate[] => templates

  return { getTemplate, getAllTemplates }
}
