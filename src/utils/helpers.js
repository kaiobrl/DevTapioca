import { VALIDATION } from '../constants/config.js';

export function getSafeStorage(key, defaultValue) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : (defaultValue === undefined ? [] : defaultValue);
    } catch (e) {
        console.warn(`Failed to read storage key ${key}:`, e);
        return defaultValue === undefined ? [] : defaultValue;
    }
}

export function setSafeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error(`Failed to write storage key ${key}:`, e);
        return false;
    }
}

export function formatPrice(price) {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export const focusTrap = {
    container: null,
    lastFocused: null,
    handler: null
};

export function enableFocusTrap(container, onClose) {
    disableFocusTrap();
    focusTrap.lastFocused = document.activeElement;
    focusTrap.container = container;
    if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');

    const selector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const all = Array.from(container.querySelectorAll(selector)).filter(el => el.offsetParent !== null);
    const first = all[0] || container;
    const last = all.length ? all[all.length - 1] : first;

    try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }

    focusTrap.handler = function (e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            if (typeof onClose === 'function') onClose();
            return;
        }

        if (e.key === 'Tab') {
            if (all.length === 0) {
                e.preventDefault();
                return;
            }
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    };

    document.addEventListener('keydown', focusTrap.handler);
}

export function disableFocusTrap() {
    if (!focusTrap.container) return;
    if (focusTrap.handler) document.removeEventListener('keydown', focusTrap.handler);
    try {
        if (focusTrap.lastFocused && typeof focusTrap.lastFocused.focus === 'function') {
            focusTrap.lastFocused.focus();
        }
    } catch (e) { }
    focusTrap.container = null;
    focusTrap.lastFocused = null;
    focusTrap.handler = null;
}

export function normalizePhone(phone) {
    return phone.replace(/\D/g, '');
}

export function formatPhone(phone) {
    const n = normalizePhone(phone);
    if (n.length === 0) return '';
    let result = '';
    if (n.length <= 2) {
        result = '(' + n;
    } else if (n.length <= 7) {
        result = '(' + n.slice(0, 2) + ') ' + n.slice(2);
    } else if (n.length <= 10) {
        result = '(' + n.slice(0, 2) + ') ' + n.slice(2, 6) + '-' + n.slice(6);
    } else {
        result = '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7, 11);
    }
    return result;
}

export function validatePhone(phone) {
    if (!phone) return { valid: false, message: 'Telefone obrigatório.' };
    const normalized = normalizePhone(phone);
    if (!VALIDATION.PHONE_NUMBERS_ONLY.test(normalized)) {
        return { valid: false, message: 'Telefone inválido. Informe 10 ou 11 dígitos (com DDD).' };
    }
    const ddd = parseInt(normalized.slice(0, 2), 10);
    if (ddd < 11 || ddd > 99 || (ddd >= 20 && ddd <= 29)) {
        return { valid: false, message: 'DDD inválido. Use um DDD válido do Brasil.' };
    }
    if (normalized.length === 11 && normalized[2] !== '9') {
        return { valid: false, message: 'Telefone celular deve ter o dígito 9 após o DDD.' };
    }
    const repeated = normalized.split('').every(c => c === normalized[0]);
    if (repeated) {
        return { valid: false, message: 'Telefone inválido. Não pode conter todos os mesmos dígitos.' };
    }
    return { valid: true, message: '' };
}

export function validateMoney(value) {
    if (!value) return { valid: true, message: '', normalized: '' };
    const cleaned = value.replace(/R?\$?\s*/g, '').trim();
    const normalized = cleaned.replace(',', '.');
    const numValue = parseFloat(normalized);
    if (isNaN(numValue) || numValue <= 0) {
        return { valid: false, message: 'Valor inválido. Informe um valor numérico maior que zero.', normalized: '' };
    }
    return { valid: true, message: '', normalized: numValue.toFixed(2).replace('.', ',') };
}

export function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const msg = document.getElementById('confirm-modal-message');
        const ok = document.getElementById('confirm-ok');
        const cancel = document.getElementById('confirm-cancel');
        const close = document.getElementById('confirm-close');

        if (!modal || !msg || !ok || !cancel) {
            resolve(confirm(message));
            return;
        }

        msg.textContent = message;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');

        const cleanup = () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            ok.removeEventListener('click', onOk);
            cancel.removeEventListener('click', onCancel);
            close.removeEventListener('click', onCancel);
        };

        const onOk = () => { cleanup(); resolve(true); };
        const onCancel = () => { cleanup(); resolve(false); };

        ok.addEventListener('click', onOk);
        cancel.addEventListener('click', onCancel);
        if (close) close.addEventListener('click', onCancel);
    });
}
