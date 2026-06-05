/**
 * DevTapioca - Main Entry Point
 * Este arquivo coordena a inicialização de todos os módulos da aplicação.
 * A modularização melhora a manutenibilidade e escalabilidade do projeto.
 */

import { initMobileMenu, initTheme } from './src/modules/ui.js';
import { initCart } from './src/modules/cart.js';
import { initMenu } from './src/modules/menu.js';
import { initCheckout } from './src/modules/checkout.js';
import { initServiceWorker } from './src/modules/sw-client.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a interface do usuário (menu mobile, tema)
    initMobileMenu();
    initTheme();

    // Inicializa o carrinho de compras
    initCart();

    // Inicializa o cardápio e renderiza os itens
    initMenu();

    // Inicializa a lógica de checkout e formulário
    initCheckout();

    // Registra o Service Worker e configura notificações
    initServiceWorker();
});
