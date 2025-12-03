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
- Reescrita das notificações (toasts) para prevenir XSS (removem tags HTML e usam `textContent`).
- Validação do checkout: nome, endereço (se entrega) e telefone (10-11 dígitos).
- Substituição de `confirm()` por modal de confirmação acessível (melhora UX e evita supressão de diálogos em abas inativas).
- Proteção de `localStorage` com getters/setters seguros (tratamento de JSON inválido / quota).
- Otimização de render do carrinho usando `DocumentFragment` e event delegation.
- CSP (meta) adicionada ao `index.html` para bloquear fontes não permitidas (recomenda-se aplicar header HTTP em produção).
- Service Worker: versão atualizada (`tapioca-v3`) e limpeza de caches antigos no `activate`.

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
