import { CONFIG } from '../constants/config.js';

const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
toastContainer.setAttribute('aria-live', 'polite');
toastContainer.setAttribute('role', 'status');
toastContainer.setAttribute('aria-atomic', 'true');
document.body.appendChild(toastContainer);

export function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = document.createElement('span');
    icon.textContent = type === 'success' ? '✅' : '⚠️';

    const text = document.createElement('p');
    text.textContent = String(message).replace(/<[^>]*>/g, '');

    toast.appendChild(icon);
    toast.appendChild(text);
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, CONFIG.TOAST_DURATION);
}

// Para compatibilidade com chamadas globais antigas se necessário
window.showToast = showToast;
