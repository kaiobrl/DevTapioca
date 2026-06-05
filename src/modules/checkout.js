import { CONFIG, VALIDATION } from '../constants/config.js';
import { 
    enableFocusTrap, 
    disableFocusTrap, 
    formatPrice, 
    normalizePhone, 
    formatPhone, 
    validatePhone, 
    validateMoney 
} from '../utils/helpers.js';
import { showToast } from '../utils/toast.js';
import { getCart, clearCart, closeCart } from './cart.js';

const checkoutModal = document.getElementById('checkout-modal');
const checkoutForm = document.getElementById('checkout-form');
const addressGroup = document.getElementById('address-group');
const addressInput = document.getElementById('client-address');
const deliveryOptions = document.getElementsByName('delivery-type');
const paymentSelect = document.getElementById('payment-method');
const changeGroup = document.getElementById('change-group');
const changeInput = document.getElementById('client-change');
const phoneInput = document.getElementById('client-phone');

export function openCheckoutModal() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Seu carrinho está vazio!', 'error');
        return;
    }
    checkoutModal.classList.add('active');
    closeCart();
    try {
        checkoutModal.setAttribute('role', 'dialog');
        checkoutModal.setAttribute('aria-modal', 'true');
    } catch (e) { }
    enableFocusTrap(checkoutModal, closeCheckoutModal);
    const firstField = checkoutModal.querySelector('input, textarea, select, button');
    if (firstField) {
        try { firstField.focus({ preventScroll: true }); } catch (e) { firstField.focus(); }
    }
}

export function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
    disableFocusTrap();
    try {
        checkoutModal.removeAttribute('role');
        checkoutModal.removeAttribute('aria-modal');
    } catch (e) { }
}

function validateCheckoutForm() {
    const name = document.getElementById('client-name').value.trim();
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const deliveryType = document.querySelector('input[name="delivery-type"]:checked')?.value;
    const address = addressInput.value.trim();

    if (!VALIDATION.NAME.test(name)) {
        showToast('Nome inválido. Use 2-50 caracteres, apenas letras e espaços.', 'error');
        document.getElementById('client-name').focus();
        return false;
    }

    if (!deliveryType) {
        showToast('Selecione o tipo de entrega.', 'error');
        return false;
    }

    if (deliveryType === 'delivery') {
        if (!address) {
            showToast('Endereço é obrigatório para entrega.', 'error');
            addressInput.focus();
            return false;
        }
        if (!VALIDATION.ADDRESS.test(address)) {
            showToast('Endereço inválido. Informe pelo menos 10 caracteres com rua, número e complemento.', 'error');
            addressInput.focus();
            return false;
        }
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
        showToast(phoneValidation.message, 'error');
        if (phoneInput) phoneInput.focus();
        return false;
    }

    if (!paymentSelect.value) {
        showToast('Selecione a forma de pagamento.', 'error');
        paymentSelect.focus();
        return false;
    }

    return true;
}

export function initCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeModalBtn = document.getElementById('close-modal');

    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeCheckoutModal);

    deliveryOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            if (e.target.value === 'pickup') {
                addressGroup.classList.add('hidden');
                addressInput.removeAttribute('required');
            } else {
                addressGroup.classList.remove('hidden');
                addressInput.setAttribute('required', 'true');
            }
        });
    });

    paymentSelect.addEventListener('change', (e) => {
        if (e.target.value === 'cash') {
            changeGroup.classList.remove('hidden');
        } else {
            changeGroup.classList.add('hidden');
            changeInput.value = '';
        }
    });

    if (phoneInput) {
        phoneInput.removeAttribute('pattern');
        phoneInput.setAttribute('autocomplete', 'tel');
        
        phoneInput.addEventListener('input', function(e) {
            let digits = normalizePhone(e.target.value).slice(0, 11);
            const formatted = formatPhone(digits);
            e.target.value = formatted;
            e.target.setSelectionRange(formatted.length, formatted.length);
        });

        phoneInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const value = normalizePhone(pastedText);
            if (value.length > 0) {
                const limitedValue = value.slice(0, 11);
                e.target.value = formatPhone(limitedValue);
            }
        });

        phoneInput.addEventListener('keydown', function(e) {
            if ([8, 9, 27, 13, 46, 35, 36, 37, 39].indexOf(e.keyCode) !== -1 ||
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
                return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    }

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateCheckoutForm()) return;

        const cart = getCart();
        const name = document.getElementById('client-name').value.trim();
        const deliveryType = document.querySelector('input[name="delivery-type"]:checked').value;
        const address = addressInput.value.trim();
        const phone = phoneInput ? normalizePhone(phoneInput.value.trim()) : '';
        const payment = paymentSelect.options[paymentSelect.selectedIndex].text;
        const changeRaw = changeInput.value.trim();

        const changeValidation = validateMoney(changeRaw);
        const change = changeValidation.valid ? changeValidation.normalized : '';

        let message = `Olá! Gostaria de fazer o seguinte pedido:\n\n`;
        message += `*Cliente:* ${name}\n`;
        message += `*Tipo:* ${deliveryType === 'delivery' ? 'Entrega 🛵' : 'Retirada 🏃'}\n`;

        if (deliveryType === 'delivery') {
            message += `*Endereço:* ${address}\n`;
        }

        if (phone) {
            message += `*Telefone:* ${formatPhone(phone)}\n`;
        }

        message += `\n*Pedido:*\n`;
        let total = 0;
        cart.forEach(item => {
            const safeName = String(item.name).replace(/[<>"'&]/g, '');
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            message += `${item.quantity}x ${safeName} - ${formatPrice(itemTotal)}\n`;
        });

        message += `\n*Total: ${formatPrice(total)}*\n`;
        message += `*Pagamento:* ${payment}\n`;

        if (change) {
            message += `*Troco para:* R$ ${change}\n`;
        }

        try {
            const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            
            showToast('Pedido enviado! Verifique o WhatsApp.', 'success');
            closeCheckoutModal();
            clearCart(true);
        } catch (error) {
            console.error('[Checkout] Erro ao abrir WhatsApp:', error);
            showToast('Erro ao abrir WhatsApp.', 'error');
        }
    });

    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) closeCheckoutModal();
    });
}
