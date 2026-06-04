# 🥥 **DevTapioca** – Tapiocaria Progressive Web App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  
[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](#)  
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](#)

## ✨ Visão geral

**DevTapioca** é um PWA responsivo para uma tapiocaria artesanal. Construído com **HTML**, **CSS** e **JavaScript** puro (sem frameworks), o site oferece:

- Navegação mobile‑first fluida
- Carrinho de compras persistente via `localStorage`
- Checkout automático por **WhatsApp**
- Tema claro/escuro com preferência salva
- Estratégias avançadas de **Service Worker** (pre‑cache, network‑first, runtime cache)
- Compatibilidade offline (fallback `offline.html`)
- Acessibilidade com atributos `aria-*` e foco visível

## 📦 Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **HTML5** | Estrutura semântica da página |
| **CSS3**  | Layout responsivo, temas, animações suaves |
| **JavaScript (ES6+)** | Lógica de carrinho, validação, registro do SW |
| **PWA** (manifest, Service Worker) | Experiência offline e instalação como app |
| **Google Fonts – Inter** | Tipografia moderna |
| **Icons – Flaticon / Unsplash** | Imagens de alta qualidade |

## 📱 Redes Sociais

[![Instagram](https://img.shields.io/badge/Instagram-%E2%9D%A4-white?logo=instagram&logoColor=white)](https://instagram.com/yourprofile)

## 📂 Estrutura do projeto

```
DevTapioca/
├─ assets/                # ícones e imagens estáticas
│   └─ icons/            # ícones PWA
├─ index.html            # página principal
├─ styles.css            # estilos globais
├─ script.js             # lógica de UI e carrinho
├─ sw.js                 # Service Worker
├─ manifest.json         # metadata PWA
├─ offline.html          # fallback offline
├─ package.json          # scripts npm (build/minify)
└─ README.md             # este documento
```

## 🚀 Rodando localmente

1. **Instale as dependências** (apenas dev scripts):
   ```bash
   npm install
   ```
2. **Inicie um servidor local** (HTTPS ou `localhost` é obrigatório para o SW):
   ```bash
   # usando Python
   python -m http.server 5000
   # ou com http‑server
   npx http-server -p 5000
   ```
3. Abra o navegador em `http://localhost:5000`.

> **⚠️ Atenção:** Não abra o arquivo via `file://` – o Service Worker não pode ser registrado nesse contexto.

## 🛠️ Build para produção

O `package.json` inclui scripts de minificação usando **terser** e **clean‑css**:

```bash
npm run build
```

Isso gera:
- `dist/script.min.js`
- `dist/styles.min.css`

Substitua os arquivos referenciados em `index.html` pelos minificados antes de publicar.

## 📱 PWA & Service Worker

- **`manifest.json`** define ícones, nome e tema de cor.
- **`sw.js`** pre‑cacheia recursos críticos (`PRECACHE_ASSETS`) e usa estratégias:
  - *Network‑first* para navegações HTML
  - *Cache‑first* para imagens
  - Fallback para `offline.html` quando a rede falha.
- Ao atualizar `sw.js`, aumente `APP_VERSION` ou altere `CACHE_NAME` para forçar a atualização.

## 🎨 Tema claro/escuro

O toggle (`#theme-toggle`) troca entre os temas e persiste a escolha em `localStorage`. A cor principal (`#ff6b6b`) foi escolhida para contraste vibrante.

## 🔐 Segurança – CSP

Meta tag CSP básica está presente em `index.html`:
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
... 
```
Para produção, recomenda‑se mover a política para cabeçalhos HTTP e remover `'unsafe-inline'` usando hashes ou nonces.

## 🐞 Resolução de problemas comuns

| Problema | Solução |
|----------|--------|
| **Service Worker não registra** | Certifique‑se de estar usando `http://localhost` ou HTTPS. Não abra via `file://`.
| **Erro `Unexpected token '<'`** | Um script está carregando HTML – verifique caminhos de `src` em `script.js`.
| **CSP bloqueia estilos** | Remova `'unsafe-inline'` e adicione hashes gerados durante o build.

## 🔮 Roadmap de Atualizações Futuras (Verificação Profunda)

Após uma análise profunda da base de código atual, identificamos os seguintes pontos de melhoria para futuras versões:

### 1. Refatoração e Arquitetura
- **Modularização do JavaScript:** O arquivo `script.js` (atualmente com ~1000 linhas) deve ser dividido em módulos (ES Modules). Sugestão de divisão: `cart.js`, `validation.js`, `ui.js` e `theme.js`.
- **Gerenciamento de Estado:** Implementar um padrão mais robusto para o carrinho em vez de manipulação direta de array e DOM, facilitando a escalabilidade.
- **Validação HTML5 Avançada:** Integrar a _Constraint Validation API_ nativa do HTML5 junto com o JavaScript para validações mais performáticas e acessíveis (`aria-invalid`, `aria-describedby`).

### 2. Performance e UX
- **Lazy Loading Aprimorado:** Utilizar `IntersectionObserver` para um carregamento de imagens mais inteligente e suave, possivelmente adicionando placeholders em base64 (blur-up).
- **Feedback de Máscaras:** Refinar as máscaras de input (como telefone e moeda) para lidar melhor com cenários de colar texto (paste) e _drag-and-drop_ de dados.
- **Notificações Push:** Implementar _Web Push Notifications_ no Service Worker para avisar o cliente sobre o status de pedidos e promoções.

### 3. Segurança
- **Aperfeiçoamento da CSP:** Remover permissões de `'unsafe-inline'` da _Content Security Policy_ gerando hashes (SHA-256) ou _nonces_ durante o processo de build para scripts e estilos.
- **Sanitização Reforçada:** Adicionar uma biblioteca leve (ex: DOMPurify) ou reforçar o regex de limpeza no input de nome e mensagens enviadas via WhatsApp para prevenir ataques baseados em injeção, mesmo que os dados não vão para um banco de dados próprio.

## 🤝 Contribuição

Contribuições são bem‑vindas! Fork o repositório, abra um *pull request* e siga as boas práticas de codestyle.

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---

*Desenvolvido com 🧡 e muita tapioca!*