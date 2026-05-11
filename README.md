# 🥥 DevTapioca — Tapiocaria PWA

Site responsivo e Progressive Web App para uma tapiocaria artesanal. O projeto é construído em HTML, CSS e JavaScript sem framework, com foco em experiência mobile-first, offline e checkout via WhatsApp.

## Índice
- [Visão geral](#visão-geral)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Rodando localmente](#rodando-localmente)
- [Build](#build)
- [Service Worker e PWA](#service-worker-e-pwa)
- [CSP e segurança](#csp-e-segurança)
- [Como continuar o projeto](#como-continuar-o-projeto)
- [Resolução de problemas comuns](#resolução-de-problemas-comuns)
- [Próximos passos recomendados](#próximos-passos-recomendados)

## Visão geral
- Projeto: `DevTapioca`
- Stack: `HTML`, `CSS`, `JavaScript`
- PWA: `manifest.json`, `sw.js`, `offline.html`
- Recursos offline, carrinho persistente e checkout via WhatsApp

## Estrutura do projeto
- `index.html` — estrutura principal, navegação, hero e modais
- `styles.css` — estilos, layout responsivo e temas
- `script.js` — lógica de carrinho, validação, modais, registro do Service Worker
- `sw.js` — Service Worker com estratégias de cache e fallback offline
- `manifest.json` — metadata do PWA
- `offline.html` — fallback visual para navegação offline
- `assets/icons/` — ícones necessários para PWA
- `package.json` — scripts de build para minificação

## Funcionalidades
- Carrinho de compras com adição, remoção, quantidade e totalização
- Persistência de carrinho usando `localStorage`
- Checkout via WhatsApp com mensagem formatada automaticamente
- Tema claro/escuro com preferência salva
- Acessibilidade com `aria-*`, foco visível e modais acessíveis
- Service Worker que pré-cacheia recursos essenciais
- Offline fallback para `offline.html`
- Validação de formulário de checkout (nome, telefone e endereço)

## Rodando localmente
O Service Worker exige HTTPS ou servidor local.

1. Instale dependências:
```bash
npm install
```

2. Execute um servidor local:
```bash
python -m http.server 5000
```
ou
```bash
npx http-server -p 5000
```

3. Abra no navegador:
```text
http://localhost:5000
```

> Não use `file://`. O Service Worker não funciona em `file://`, e você verá erros como `Failed to register a ServiceWorker: origin ('null') not supported`.

## Build
O projeto já possui um `package.json` com scripts de build.

Execute:
```bash
npm run build
```

Isso gera:
- `dist/script.min.js`
- `dist/styles.min.css`

Use esses arquivos para produção se quiser reduzir o tamanho e melhorar a performance.

## Service Worker e PWA
- `sw.js` pré-cacheia os recursos definidos em `PRECACHE_ASSETS`
- Navegações HTML usam estratégia network-first
- Imagens usam cache-first com runtime cache limitado
- Exibe `offline.html` quando está offline e não há recurso em cache
- O SW só deve ser registrado em contexto seguro (`https:`, `localhost`, `127.0.0.1`, `[::1]`)

### Importante
- Ao atualizar `sw.js`, aumente a versão `APP_VERSION` ou modifique `CACHE_NAME` para forçar atualização
- Em produção, prefira configurar CSP por cabeçalhos HTTP em vez de apenas meta tag

## CSP e segurança
A página já inclui uma regra CSP básica no `index.html`. Em desenvolvimento, a CSP usa:
- `script-src 'self' 'unsafe-inline'`
- `style-src 'self' 'unsafe-inline'`

Para deixar o projeto mais seguro:
- remova o `'unsafe-inline'` de `style-src`
- prefira hashes ou nonces para scripts e estilos inline
- use cabeçalhos HTTP de CSP em vez de meta tags para deploy

## Como continuar o projeto
1. Trabalhe no `index.html` para ajustar layout, botões e modais.
2. Use `styles.css` para responsividade e tema.
3. Atualize `script.js` para lógica de carrinho, validações e comportamentos.
4. Teste o PWA no navegador via servidor local.
5. Use `sw.js` para estratégias de cache e offline.

## Resolução de problemas comuns
- `Failed to register a ServiceWorker: origin ('null') not supported`
  - Abra via servidor local, não `file://`
- `Unexpected token '<'` em um arquivo JS desconhecido
  - Normalmente indica que o navegador carregou HTML em vez de JS
  - Verifique se não há URL de script errada ou extensão injetando um arquivo externo
- `Failed to convert value to 'Response'`
  - O Service Worker agora garante sempre retornar um `Response` válido no fallback
- `Inline script violates CSP`
  - Mova JS para `script.js` ou use nonce/hash se precisar de inline controlado

## Próximos passos recomendados
- separar o código em arquivos menores ou módulos (quando for feito bundle)
- adicionar testes para a lógica do carrinho e validação de checkout
- hospedar imagens de cardápio localmente e pré-cacheá-las no SW
- tratar melhor atualização de Service Worker com prompt de atualização ao usuário
- revisar CSP e remoção de inline styles/scripts para produção

---
Desenvolvido com 🧡 e muita tapioca!