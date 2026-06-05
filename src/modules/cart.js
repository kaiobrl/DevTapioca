import { CONFIG } from '../constants/config.js';
import { getSafeStorage, setSafeStorage, formatPrice, enableFocusTrap, disableFocusTrap, showConfirm } from '../utils/helpers.js';
import { showToast } from '../utils/toast.js';

let cart = getSafeStorage(CONFIG.CART_STORAGE_KEY, []);

const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartEmpty = document.getElementById('cart-empty');
const cartTotalPrice = document.getElementById('cart-total-price');

export function getCart() {
    return cart;
}

export function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    try {
        const title = cartSidebar.querySelector('h2');
        if (title) title.focus({ preventScroll: true });
    } catch (e) {}
    try {
        cartSidebar.setAttribute('role', 'dialog');
        cartSidebar.setAttribute('aria-modal', 'true');
    } catch (e) { }
    enableFocusTrap(cartSidebar, closeCart);
}

export function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
    disableFocusTrap();
    try {
        cartSidebar.removeAttribute('role');
        cartSidebar.removeAttribute('aria-modal');
    } catch (e) { }
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function saveCart() {
    setSafeStorage(CONFIG.CART_STORAGE_KEY, cart);
}

function createCartItemElement(item, index) {
    const li = document.createElement('li');
    li.className = 'cart-item';

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;

    const details = document.createElement('div');
    details.className = 'cart-item-details';

    const h4 = document.createElement('h4');
    h4.textContent = item.name;

    const price = document.createElement('p');
    price.className = 'cart-item-price';
    price.textContent = formatPrice(item.price);

    details.appendChild(h4);
    details.appendChild(price);

    const controls = document.createElement('div');
    controls.className = 'cart-item-controls';

    const minusBtn = document.createElement('button');
    minusBtn.className = 'qty-btn qty-minus';
    minusBtn.dataset.index = index;
    minusBtn.setAttribute('aria-label', 'Diminuir quantidade');
    minusBtn.textContent = '−';

    const qtyDisplay = document.createElement('span');
    qtyDisplay.className = 'qty-display';
    qtyDisplay.textContent = item.quantity;

    const plusBtn = document.createElement('button');
    plusBtn.className = 'qty-btn qty-plus';
    plusBtn.dataset.index = index;
    plusBtn.setAttribute('aria-label', 'Aumentar quantidade');
    plusBtn.textContent = '+';

    controls.appendChild(minusBtn);
    controls.appendChild(qtyDisplay);
    controls.appendChild(plusBtn);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'cart-item-remove';
    removeBtn.dataset.index = index;
    removeBtn.setAttribute('aria-label', 'Remover item');
    removeBtn.textContent = '🗑️';

    li.appendChild(img);
    li.appendChild(details);
    li.appendChild(controls);
    li.appendChild(removeBtn);

    return li;
}

export function renderCart() {
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartItems.style.display = 'none';
        cartTotalPrice.textContent = formatPrice(0);
        updateCartCount();
        cartItems.innerHTML = '';
        return;
    }

    cartEmpty.style.display = 'none';
    cartItems.style.display = 'block';

    const fragment = document.createDocumentFragment();
    cart.forEach((item, index) => {
        fragment.appendChild(createCartItemElement(item, index));
    });

    cartItems.innerHTML = '';
    cartItems.appendChild(fragment);

    cartTotalPrice.textContent = formatPrice(calculateTotal());
    updateCartCount();
}

export function addToCart(name, price, image) {
    try {
        if (!name || name.trim().length === 0) {
            showToast('Erro: nome do item inválido.', 'error');
            return;
        }
        if (!price || Number.isNaN(Number(price))) {
            showToast('Erro: preço inválido.', 'error');
            return;
        }
        const numericPrice = parseFloat(price);
        if (numericPrice <= 0) {
            showToast('Erro: preço deve ser maior que zero.', 'error');
            return;
        }
        if (!image || typeof image !== 'string') {
            showToast('Erro: imagem do item inválida.', 'error');
            return;
        }

        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            if (existingItem.quantity < CONFIG.MAX_CART_ITEMS) {
                existingItem.quantity += 1;
                showToast(`Mais uma unidade de ${name} adicionada!`);
            } else {
                showToast(`Limite de ${CONFIG.MAX_CART_ITEMS} unidades atingido para este item.`, 'error');
                return;
            }
        } else {
            cart.push({ 
                name: String(name).trim(), 
                price: numericPrice, 
                image: String(image), 
                quantity: 1 
            });
            showToast(`${name} adicionado ao carrinho!`);
        }

        saveCart();
        renderCart();
    } catch (error) {
        console.error('[Cart] Erro ao adicionar item:', error);
        showToast('Erro ao adicionar item.', 'error');
    }
}

export function removeItem(index) {
    const item = cart[index];
    cart.splice(index, 1);
    saveCart();
    renderCart();
    showToast(`${item.name} removido do carrinho.`, 'error');
}

export function increaseQuantity(index) {
    if (cart[index].quantity < CONFIG.MAX_CART_ITEMS) {
        cart[index].quantity += 1;
        saveCart();
        renderCart();
    } else {
        showToast(`Limite de ${CONFIG.MAX_CART_ITEMS} unidades atingido.`, 'error');
    }
}

export function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        saveCart();
        renderCart();
    } else {
        removeItem(index);
    }
}

export function clearCart() {
    cart = [];
    saveCart();
    renderCart();
    showToast('Carrinho limpo com sucesso!', 'success');
}

// Init cart event listeners
export function initCart() {
    const cartToggle = document.getElementById('cart-toggle');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    const clearCartBtn = document.getElementById('clear-cart');

    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (clearCartBtn) clearCartBtn.addEventListener('click', () => clearCart());

    cartItems.addEventListener('click', (e) => {
        const target = e.target;
        const index = parseInt(target.dataset.index, 10);
        if (isNaN(index)) return;

        if (target.classList.contains('qty-minus')) {
            decreaseQuantity(index);
        } else if (target.classList.contains('qty-plus')) {
            increaseQuantity(index);
        } else if (target.classList.contains('cart-item-remove')) {
            removeItem(index);
        }
    });

    renderCart();
}
