# QR Code Studio - Teste para desenvolvedor | Supranet

![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?style=flat&logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.x-fbf0df?style=flat&logo=bun&logoColor=black)
![Pinia](https://img.shields.io/badge/Pinia-2.x-FFD859?style=flat&logo=pinia&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat&logo=docker&logoColor=white)

![Guia de Features](./docs/feats-qrcode-studio.png)

## Demo mobile

<video src="./docs/demo-mobile.mp4" controls width="360"></video>

## Índice

- [Demo mobile](#demo-mobile)
- [Arquitetura e decisões técnicas](#arquitetura-e-decisões-técnicas)
- [Integração com a API goQR.me](#integração-com-a-api-goqrme)
- [Funcionalidades do teste](#funcionalidades-do-teste)
- [Funcionalidades adicionadas durante refinamento](#funcionalidades-adicionadas-no-refinamento)
- [Como rodar](#como-rodar)

## Arquitetura e decisões técnicas

A aplicação é uma SPA Nuxt 4 sem `/pages` — `app.vue` é o root único, com três componentes principais orquestrados diretamente: `QRForm`, `QRPreview` e `QRHistory`.

**Decisões relevantes:**

- **Pinia** gerencia o estado global (`currentConfig`, `history`, `notification`), evitando prop drilling entre os componentes e centralizando a persistência no `localStorage`
- **Proxy server-side** (`server/api/qrcode.get.ts`) encapsula o acesso à API externa, permitindo validação de parâmetros no servidor e evitando expor a URL da API diretamente no cliente. Também adiciona cache de 1h via `Cache-Control`
- **Composable `useQRActions`** centraliza as ações de negócio (`handleGenerate`, `downloadQR`, histórico), mantendo `app.vue` responsável apenas pela orquestração de UI
- **Composable `useQRCode`** isola a lógica de montagem da URL, separando apresentação de lógica de negócio
- **Composable `useQRTemplates`** centraliza a definição dos 6 templates (campos, formatação, validação e ícones), tornando fácil adicionar novos tipos sem alterar componentes
- **SSR safety** — acessos ao `localStorage` são guardados com `import.meta.client` para evitar erros no servidor

## Integração com a API goQR.me

A chamada à API nunca é feita diretamente do browser. O fluxo completo:

```mermaid
sequenceDiagram
    actor U as Usuário
    participant F as QRForm
    participant AC as useQRActions
    participant S as qrStore (Pinia)
    participant C as useQRCode
    participant P as /api/qrcode (Nitro)
    participant A as api.qrserver.com
    participant PV as QRPreview

    U->>F: preenche campos e clica Gerar
    F->>AC: handleGenerate(templateType)
    AC->>S: lê currentConfig
    AC->>C: generateUrl(config)
    C-->>AC: /api/qrcode?data=...&size=...&color=...
    AC->>P: GET /api/qrcode?...
    P->>P: valida parâmetros
    P->>A: GET /v1/create-qr-code?...
    A-->>P: imagem binária
    P-->>AC: imagem com Cache-Control: 1h
    AC->>S: saveToHistory(item)
    S->>S: persiste no localStorage
    AC-->>PV: generatedUrl atualizada
    PV-->>PV: imagem carregada (@load)
    PV->>AC: emit loaded
    AC-->>U: scroll até preview (mobile)
```

O proxy valida: presença do campo `data`, tamanho máximo de 900 caracteres, formato (`png`, `jpg`, `svg`, etc.) e padrão do tamanho (`NxN`). Erros são propagados com status HTTP adequado e exibidos via toast ao usuário.

## Funcionalidades do teste

- **Geração de QR Code** a partir de texto livre ou URL via API goQR.me
- **Configurações**: tamanho em pixels, cor do QR, cor de fundo e formato (PNG, SVG, JPEG)
- **Download** da imagem gerada
- **Histórico** dos últimos QR Codes gerados com miniatura, conteúdo e configurações
- **Recarregamento** de configurações ao clicar em item do histórico
- **Persistência** do histórico via `localStorage`
- **Proxy server-side** em `server/api/qrcode.get.ts` encapsulando o acesso à API externa
- **Mensagens de erro** amigáveis para falhas ou parâmetros inválidos
- **Layout responsivo** para desktop, tablet e mobile
- **Componentização** (formulário, preview, histórico, notificações)

## Funcionalidades adicionadas no refinamento
- **6 templates** de QR Code: Texto livre, URL, Wi-Fi, E-mail, Telefone e vCard
- **Color picker** customizado com swatch clicável e campo hex editável
- **Live preview** enquanto o usuário digita
- **Copiar** o QR Code diretamente para a área de transferência
- **Busca** no histórico por texto ou ID do QR Code
- **Filtro** por tipo de template no histórico
- **Deduplicação automática** de entradas no histórico
- **Scroll automático** até o preview no mobile após gerar
- **Notificações toast** para todas as ações (sucesso, erro e informativo)

## Como rodar

### Com Docker

```bash
# Clone o repositório
git clone https://github.com/alanmartinsdeazevedo/teste_dev_supra.git
cd teste_dev_supra

# Build da imagem
docker build -t qr-code-studio .

# Rodar o container
docker run -p 3000:3000 qr-code-studio
```

Acesse em **http://localhost:3000**

### Com Docker Compose

```bash
docker compose up
```

### Localmente

```bash
# Com Bun
bun install
bun run dev

# Com npm
npm install
npm run dev
```

> A aplicação não requer variáveis de ambiente. A API do goQR.me é pública e acessada via proxy interno.
