# 🥥 DevTapioca — Tapiocaria do Dev

Site responsivo e PWA (Progressive Web App) para uma tapiocaria artesanal. Projeto focado em Mobile‑First com funcionalidades práticas: cardápio interativo, carrinho persistente e finalização via WhatsApp.

## **Visão Geral**
- **Projeto:** `DevTapioca` (pastas do projeto no repositório)
- **PWA:** O app inclui `manifest.json`, `sw.js` (Service Worker) e ícones em `assets/icons/` para instalação em dispositivos móveis.

## **Funcionalidades**
- **PWA / Offline:** `sw.js` pré-cacheia recursos essenciais e serve uma página offline (`offline.html`) quando necessário.
- **Carrinho de Compras:** Adição, remoção e ajuste de quantidade; persistência em `localStorage`.
- **Checkout via WhatsApp:** Gera uma mensagem formatada para envio ao WhatsApp da loja.
- **Tema Claro/Escuro:** Alternância com persistência da preferência do usuário.
- **Acessibilidade:** Uso de atributos ARIA, foco visível e atalhos para melhor usabilidade.

## **Arquivos principais**
- **`index.html`**: estrutura da interface e pontos de entrada para scripts.
- **`styles.css`**: estilos responsivos e temas.
- **`script.js`**: lógica do carrinho, UI e acessibilidade.
- **`sw.js`**: service worker com estratégias:
   - Navegação (HTML): network-first (atualiza cache com a versão mais recente).
   - Imagens: cache-first em cache runtime com limite (trim).
   - CSS/JS/fontes: stale-while-revalidate (serve do cache e atualiza em segundo plano).
- **`manifest.json`**: metadados para instalação (nome, ícones, cores, start_url).
- **`offline.html`**: fallback exibido quando a navegação falha e não há conteúdo em cache.

## **Como executar localmente**
Você pode abrir `index.html` diretamente no navegador, mas para testar o Service Worker (registrado em `script.js`) é preciso servir via HTTP (não funciona via `file://`). Algumas opções:

- **Python 3 (rápido):**
```pwsh
# na pasta do projeto
python -m http.server 5000
# ou (Windows) com PowerShell
py -3 -m http.server 5000
```

- **Node (http-server):**
```pwsh
npm install -g http-server
http-server -p 5000
```

- **VS Code — Live Server:** usar a extensão Live Server e abrir em `http://127.0.0.1:5500` (ou porta configurada).

Abra `http://localhost:5000` (ou a porta escolhida) para testar o PWA e o Service Worker.

## **Como testar o Service Worker / PWA**
- Abra as DevTools (Chrome/Edge) → `Application` → `Service Workers` para ver o status.
- No painel `Application`, em `Manifest` você verá os dados do `manifest.json`.
- Para testar offline, ative `Offline` nas DevTools (Network) e navegue pela app — a `offline.html` será mostrada quando apropriado.

## **Conselhos de desenvolvimento**
- Para atualizar cache quando modificar `sw.js`, incremente o `CACHE_NAME` (ex.: `tapioca-v3`) para forçar remoção de caches antigos.
- Ícones estão em `assets/icons/` (PNG e SVG). Verifique `manifest.json` para garantir caminhos corretos.
- Lógica principal do app está em `script.js` — pontos importantes:
   - Persistência do carrinho em `localStorage` (`cart`).
   - Funções de acessibilidade: focus trap e gestão de estados do modal/cart.
   - Registro do Service Worker (verifique se `script.js` contém `navigator.serviceWorker.register(...)`).

## **Testes rápidos**
- Verificar adição/remoção no carrinho e persistência após recarregar a página.
- Simular pagamento/checkout e checar o texto gerado para WhatsApp.
- Testar instalação do PWA em dispositivos móveis (Add to Home Screen) quando o site estiver servido via HTTPS ou `localhost`.

## **Contribuição e próximos passos**
- **Melhorias possíveis:** mask de CEP/endereço, integração com pagamento (somente direcionamento para WhatsApp por enquanto), internacionalização (i18n).
- **Publicação:** para publicar como PWA, hospede em HTTPS (ex.: Netlify, Vercel, GitHub Pages) e verifique políticas de cache.

## **Licença**
- Projeto livre para fins educacionais e de aprendizado.

---
Desenvolvido com 🧡 e muita tapioca!
