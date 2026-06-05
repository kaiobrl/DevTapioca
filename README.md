# 🥥 **DevTapioca** – Tapiocaria Progressive Web App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  
[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](#)  
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](#)

## ✨ Visão geral

**DevTapioca** é um PWA (Progressive Web App) moderno e responsivo para uma tapiocaria artesanal. O projeto evoluiu de um site estático para uma aplicação robusta, utilizando **Arquitetura Modular** e **JavaScript Moderno (ES6+)**.

### Principais Funcionalidades:
- **Arquitetura Modular**: Código organizado em módulos ES6 para alta manutenibilidade.
- **Cardápio Dinâmico**: Renderização inteligente baseada em dados, facilitando atualizações.
- **PWA Completo**: Instalável, funciona offline e suporta notificações.
- **Carrinho de Compras**: Persistente via `localStorage` com cálculo em tempo real.
- **Checkout via WhatsApp**: Envio de pedido estruturado diretamente para o vendedor.
- **Acessibilidade (A11y)**: Focus trap em modais, semântica HTML5 e suporte a leitores de tela.
- **Performance**: Otimização de imagens com `srcset` e estratégias de cache avançadas.

## 📦 Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **HTML5** | Estrutura semântica e acessível |
| **CSS3**  | Design responsivo, temas (Dark/Light) e animações |
| **JavaScript (ES6+)** | Módulos, Fetch API, LocalStorage e DOM Dinâmico |
| **Service Workers** | Cache Offline, Pre-cache e Notificações Push |
| **PWA Manifest** | Transformação em aplicativo nativo |

## 📂 Estrutura do projeto

```
DevTapioca/
├─ src/                   # Código fonte modular
│   ├─ constants/         # Configurações globais e validações
│   ├─ data/              # Dados do cardápio (menuData.js)
│   ├─ modules/           # Lógica de negócio (cart, menu, checkout, etc.)
│   └─ utils/             # Auxiliares (toast, helpers, focus trap)
├─ assets/                # Ícones e recursos estáticos
├─ index.html            # Ponto de entrada HTML
├─ script.js             # Orquestrador principal (Main Entry)
├─ sw.js                 # Service Worker (Gerenciamento de Cache)
├─ manifest.json         # Metadados do PWA
├─ offline.html          # Fallback para ausência de conexão
└─ package.json          # Scripts e dependências
```

## 🚀 Rodando localmente

1. **Instale as dependências** (opcional para build):
   ```bash
   npm install
   ```
2. **Inicie um servidor local**:
   Como o projeto utiliza **ES Modules** e **Service Workers**, é obrigatório o uso de um servidor (HTTP/HTTPS).
   ```bash
   # Usando npx (recomendado)
   npx http-server -p 5000
   ```
3. Abra `http://localhost:5000` no seu navegador.

> **Nota:** O Service Worker requer uma origem segura (`localhost` ou `https`).

## 🛠️ Arquitetura Modular

O projeto utiliza **ES Modules** nativos. A lógica foi separada para garantir que o crescimento do app seja sustentável:
- **`cart.js`**: Gerencia o estado do carrinho e persistência.
- **`menu.js`**: Responsável pela filtragem e renderização dos itens.
- **`checkout.js`**: Validação rigorosa de formulários e integração com WhatsApp.
- **`ui.js`**: Controla elementos globais como menu mobile e tema dark.

## � PWA & Offline

- **Estratégias de Cache**:
  - `Network-first`: Para o HTML principal, garantindo sempre a versão mais nova.
  - `Cache-first`: Para imagens e fontes (alta performance).
  - `Stale-while-revalidate`: Para scripts e estilos.
- **Notificações**: Suporte integrado para permissões de notificação, preparando o app para engajamento via Push.

## 🎨 Temas e Personalização

O sistema de temas utiliza variáveis CSS e persiste a preferência do usuário. A paleta de cores foi desenhada para garantir contraste e legibilidade tanto no modo claro quanto no escuro.

## 🤝 Contribuição

Este é um projeto de aprendizado contínuo. Sinta-se à vontade para abrir issues ou enviar Pull Requests.

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---

*Desenvolvido com 🧡 e arquitetura limpa!*
