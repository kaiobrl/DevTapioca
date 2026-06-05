import { showToast } from '../utils/toast.js';

async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('[SW] Notificações não suportadas');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            showToast('Notificações ativadas! Avisaremos quando seu pedido estiver pronto.', 'success');
            return true;
        }
    }
    return false;
}

export function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        const isSecureContext = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '[::1]';
        if (isSecureContext) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then((registration) => {
                        console.log('[SW] Service Worker registrado:', registration.scope);
                        
                        setTimeout(() => {
                            if (Notification.permission === 'default') {
                                requestNotificationPermission();
                            }
                        }, 5000);

                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            if (newWorker) {
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                        showToast('Nova versão disponível! Recarregue a página para atualizar.', 'success');
                                    }
                                });
                            }
                        });
                    })
                    .catch((err) => {
                        console.error('[SW] Falha ao registrar Service Worker:', err);
                    });
            });
        }
    }

    window.addEventListener('error', (event) => {
        console.error('[App] Erro não tratado:', event.error);
        if (event.error && !event.error.handled) {
            showToast('Ocorreu um erro inesperado.', 'error');
        }
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('[App] Promise rejeitada:', event.reason);
        event.preventDefault();
    });
}
