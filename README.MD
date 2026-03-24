# QR Code Studio - Teste para desenvolvedor | Supranet

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

## Instruções
* Todas as instruções estão no arquivo instrucoes.md
* No diretório do repositório, rode `docker compose up`.
