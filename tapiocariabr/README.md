# 🥥 DevTapioca — Tapiocaria do Dev

Site responsivo e PWA (Progressive Web App) para uma tapiocaria artesanal. Projeto focado em Mobile‑First com funcionalidades práticas: cardápio interativo, carrinho persistente e finalização via WhatsApp.

## Visão geral
- **Projeto:** `DevTapioca`
- **PWA:** `manifest.json`, `sw.js` (Service Worker) e ícones em `assets/icons/`.

## Funcionalidades principais (atualizado)
- PWA / Offline: `sw.js` pré-cacheia recursos essenciais e serve `offline.html` quando necessário.
- Carrinho de Compras: adição, remoção, ajuste de quantidade e persistência em `localStorage`.
- Checkout via WhatsApp: geração de mensagem com nome, telefone, endereço (quando aplicável), itens e total.
- Tema Claro/Escuro: preferência persistida.
- Acessibilidade: focus traps, `aria-*` e toast com `aria-live`.
- Confirmação acessível: modal de confirmação em DOM (substitui `window.confirm`).

## Melhorias implementadas (segurança e performance)

### Segurança
- Reescrita das notificações (toasts) para prevenir XSS (removem tags HTML e usam `textContent`).
- Validação robusta do checkout: nome, endereço (se entrega) e telefone brasileiro (DDD + número).
- Substituição de `confirm()` por modal de confirmação acessível (melhora UX e evita supressão de diálogos em abas inativas).
- Proteção de `localStorage` com getters/setters seguros (tratamento de JSON inválido / quota).
- CSP (meta) adicionada ao `index.html` para bloquear fontes não permitidas (recomenda-se aplicar header HTTP em produção).

### Performance e Código
- Otimização de render do carrinho usando `DocumentFragment` e event delegation.
- Refatoração da função `renderCart()` em funções menores e mais manuteníveis.
- Service Worker: versionamento automático (`APP_VERSION`) e limpeza de caches antigos no `activate`.
- Logging melhorado no Service Worker para facilitar debug.
- Tratamento de erros aprimorado com try/catch e feedback ao usuário.

### Validações
- **Telefone brasileiro**: Validação de DDD (11-99) e formato (10-11 dígitos) com máscara automática.
- **Endereço**: Validação mais específica (mínimo 10 caracteres, aceita letras, números e caracteres comuns).
- **Valor monetário**: Validação robusta do campo de troco com normalização de formato.

### UX
- Máscara automática de telefone no input (formatação enquanto digita).
- Feedback de foco nos campos com erro durante validação.
- Detecção de atualizações do Service Worker com notificação ao usuário.
- Tratamento de erros globais com mensagens amigáveis.

## Arquivos principais
- `index.html` — estrutura e markup (agora contém modal de confirmação e campo de telefone no checkout).
- `styles.css` — estilos, animações e modal.
- `script.js` — lógica do app (carrinho, modais, validação, SW registration).
- `sw.js` — Service Worker (cache strategies).
- `manifest.json`, `offline.html`, `assets/icons/`.

## Rodando localmente
Servir via HTTP é necessário para testar Service Worker.

Python (rápido):
```pwsh
python -m http.server 5000
```

Node (http-server):
```pwsh
npm install -g http-server
http-server -p 5000
```

Abra `http://localhost:5000`.

## Build (minificação)
Adicionei um `package.json` com scripts para minificar/bundle JS e minificar CSS (usa `esbuild` e `clean-css-cli`).

Instalação e build:
```bash
npm install
npm run build
```

Isso gerará `dist/script.min.js` e `dist/styles.min.css`.

## Notas sobre Service Worker e deploy
- Ao atualizar `sw.js`, incremente `CACHE_NAME` ou publique um novo `sw.js` para forçar atualização.
- Para PWA em produção, hospede com HTTPS e configure CSP via cabeçalhos HTTP (meta tag é útil, mas headers são preferíveis).

## Testes rápidos
1. Adicione itens no carrinho, abra/feche página, verifique persistência.
2. Clique em **Limpar Carrinho** — modal de confirmação aparecerá.
3. Faça checkout preenchendo nome, telefone e endereço (se entrega) — WhatsApp abre com a mensagem.
4. Teste offline: ative `Offline` nas DevTools → navegue e verifique fallback para `offline.html`.

## Próximos passos recomendados
- Remover `style-src 'unsafe-inline'` da CSP e usar nonces/hashes.
- Hospedar imagens de cardápio localmente e pré-cacheá-las no SW para experiência offline completa.
- Implementar testes unitários para lógica do carrinho (Jest).

---
Desenvolvido com 🧡 e muita tapioca!
