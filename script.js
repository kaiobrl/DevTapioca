// Configuration and validation
const CONFIG = {
    WHATSAPP_NUMBER: '5583981374944',
    CART_STORAGE_KEY: 'cart',
    THEME_STORAGE_KEY: 'theme',
    MAX_CART_ITEMS: 99,
    TOAST_DURATION: 3000
};

const VALIDATION = {
    NAME: /^[a-záàâãéèêíïóôõöúçñ\s]{2,50}$/i,
    ADDRESS: /^.{5,100}$/,
    PHONE: /^\d{10,11}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    // Accessibility: announce toasts to screen readers
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('role', 'status');
    toastContainer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toastContainer);

    window.showToast = function (message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Safe construction to avoid XSS
        const icon = document.createElement('span');
        icon.textContent = type === 'success' ? '✅' : '⚠️';

        const text = document.createElement('p');
        // strip any HTML tags from incoming message
        text.textContent = String(message).replace(/<[^>]*>/g, '');

        toast.appendChild(icon);
        toast.appendChild(text);
        toastContainer.appendChild(toast);

        // Remove after configured duration
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, CONFIG.TOAST_DURATION);
    };

    // ==========================================
    // MOBILE MENU
    // ==========================================
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function () {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking nav links
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // ==========================================
    // THEME TOGGLE
    // ==========================================
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem(CONFIG.THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');

    function applyTheme(t) {
        if (t === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            themeBtn.textContent = '☀️';
            themeBtn.setAttribute('aria-pressed', 'true');
            // update theme-color meta
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', '#0b0c0d');
        } else {
            document.body.removeAttribute('data-theme');
            themeBtn.textContent = '🌙';
            themeBtn.setAttribute('aria-pressed', 'false');
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', '#ff6b35');
        }
    }

    if (themeBtn) {
        applyTheme(initTheme);
        themeBtn.addEventListener('click', function () {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            const next = isDark ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem(CONFIG.THEME_STORAGE_KEY, next);
        });
    }

    // ==========================================
    // FOCUS TRAP / ACCESSIBILITY HELPERS
    // ==========================================
    const focusTrap = {
        container: null,
        lastFocused: null,
        handler: null
    };

    function enableFocusTrap(container, onClose) {
        // disable any existing trap
        disableFocusTrap();
        focusTrap.lastFocused = document.activeElement;
        focusTrap.container = container;
        // ensure container is reachable
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

    function disableFocusTrap() {
        if (!focusTrap.container) return;
        if (focusTrap.handler) document.removeEventListener('keydown', focusTrap.handler);
        try {
            if (focusTrap.lastFocused && typeof focusTrap.lastFocused.focus === 'function') {
                focusTrap.lastFocused.focus();
            }
        } catch (e) {
            // ignore
        }
        focusTrap.container = null;
        focusTrap.lastFocused = null;
        focusTrap.handler = null;
    }

    // ==========================================
    // SHOPPING CART
    // ==========================================
    // Safe localStorage helpers to avoid exceptions (quota, corrupt JSON)
    function getSafeStorage(key, defaultValue) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : (defaultValue === undefined ? [] : defaultValue);
        } catch (e) {
            console.warn(`Failed to read storage key ${key}:`, e);
            return defaultValue === undefined ? [] : defaultValue;
        }
    }

    function setSafeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Failed to write storage key ${key}:`, e);
            return false;
        }
    }

    // initialize cart from safe storage
    let cart = getSafeStorage(CONFIG.CART_STORAGE_KEY, []);

    const cartToggle = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartClose = document.getElementById('cart-close');
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');

    // Open cart
    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Move focus to cart title for keyboard/screen-reader users
        try {
            const title = cartSidebar.querySelector('h2');
            if (title) {
                // ensure element is focusable (tabindex already set in markup)
                title.focus({ preventScroll: true });
            }
        } catch (e) {
            // fail silently
            console.warn('Focus to cart title failed', e);
        }
        // Mark as dialog and enable focus trap
        try {
            cartSidebar.setAttribute('role', 'dialog');
            cartSidebar.setAttribute('aria-modal', 'true');
        } catch (e) { }
        enableFocusTrap(cartSidebar, closeCart);
    }

    // Close cart
    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
        // disable focus trap and restore attributes
        disableFocusTrap();
        try {
            cartSidebar.removeAttribute('role');
            cartSidebar.removeAttribute('aria-modal');
        } catch (e) { }
    }

    // Update cart count badge
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // Calculate total price
    function calculateTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Format price
    function formatPrice(price) {
        return `R$ ${price.toFixed(2).replace('.', ',')}`;
    }

    // Save cart to localStorage (safe)
    function saveCart() {
        setSafeStorage(CONFIG.CART_STORAGE_KEY, cart);
    }

    // Render cart items (optimized)
    function renderCart() {
        if (cart.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.style.display = 'none';
            cartTotalPrice.textContent = formatPrice(0);
            updateCartCount();
            // clean any previous delegated handler
            if (cartItems._handler) {
                cartItems.removeEventListener('click', cartItems._handler);
                cartItems._handler = null;
            }
            cartItems.innerHTML = '';
            return;
        }

        cartEmpty.style.display = 'none';
        cartItems.style.display = 'block';

        // Build items using DocumentFragment to reduce reflows
        const fragment = document.createDocumentFragment();

        cart.forEach((item, index) => {
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

            fragment.appendChild(li);
        });

        cartItems.innerHTML = '';
        cartItems.appendChild(fragment);

        // Delegated handler for cart controls (attach once)
        if (cartItems._handler) {
            cartItems.removeEventListener('click', cartItems._handler);
        }

        cartItems._handler = function (e) {
            const target = e.target;
            if (target.classList.contains('qty-minus')) {
                decreaseQuantity(parseInt(target.dataset.index, 10));
            } else if (target.classList.contains('qty-plus')) {
                increaseQuantity(parseInt(target.dataset.index, 10));
            } else if (target.classList.contains('cart-item-remove')) {
                removeItem(parseInt(target.dataset.index, 10));
            }
        };

        cartItems.addEventListener('click', cartItems._handler);

        cartTotalPrice.textContent = formatPrice(calculateTotal());
        updateCartCount();
    }

    // Add item to cart
    function addToCart(name, price, image) {
        // Basic validation
        if (!name || !price || Number.isNaN(Number(price))) {
            showToast('Erro ao adicionar item: dados inválidos.', 'error');
            return;
        }

        const numericPrice = parseFloat(price);
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            if (existingItem.quantity < CONFIG.MAX_CART_ITEMS) {
                existingItem.quantity += 1;
                showToast(`Mais uma unidade de ${name} adicionada!`);
            } else {
                showToast(`Limite de ${CONFIG.MAX_CART_ITEMS} unidades atingido.`, 'error');
                return;
            }
        } else {
            cart.push({ name: String(name), price: numericPrice, image: String(image), quantity: 1 });
            showToast(`${name} adicionado ao carrinho!`);
        }

        saveCart();
        renderCart();
    }

    // Remove item from cart
    function removeItem(index) {
        const item = cart[index];
        cart.splice(index, 1);
        saveCart();
        renderCart();
        showToast(`${item.name} removido do carrinho.`, 'error');
    }

    // Increase quantity
    function increaseQuantity(index) {
        if (!cart[index]) return;
        if (cart[index].quantity < CONFIG.MAX_CART_ITEMS) {
            cart[index].quantity += 1;
            saveCart();
            renderCart();
        }
    }

    // Decrease quantity
    function decreaseQuantity(index) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            removeItem(index);
            return;
        }
        saveCart();
        renderCart();
    }
    // Confirmation modal helper using the DOM (returns a Promise<boolean>)
    function showConfirm(message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const msg = document.getElementById('confirm-modal-message');
            const ok = document.getElementById('confirm-ok');
            const cancel = document.getElementById('confirm-cancel');
            const close = document.getElementById('confirm-close');

            if (!modal || !msg || !ok || !cancel) {
                // Fallback to native confirm if modal not available
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

    // Clear cart
    // If `force` is true, skip the confirmation modal (useful when called programmatically)
    async function clearCart(force = false) {
        if (!force) {
            // If page is not focused/visible, avoid showing modal (it may be suppressed)
            if (document.hidden || !document.hasFocus()) {
                showToast('A página não está ativa — ação cancelada.', 'error');
                return;
            }

            const confirmed = await showConfirm('Tem certeza que deseja limpar o carrinho?');
            if (!confirmed) return;
        }

        cart = [];
        saveCart();
        renderCart();
        showToast('Carrinho limpo com sucesso!', 'success');
    }

    // ==========================================
    // CHECKOUT MODAL
    // ==========================================
    const checkoutModal = document.getElementById('checkout-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const addressGroup = document.getElementById('address-group');
    const addressInput = document.getElementById('client-address');
    const deliveryOptions = document.getElementsByName('delivery-type');
    const paymentSelect = document.getElementById('payment-method');
    const changeGroup = document.getElementById('change-group');
    const changeInput = document.getElementById('client-change');

    // Open Modal
    function openCheckoutModal() {
        if (cart.length === 0) {
            showToast('Seu carrinho está vazio!', 'error');
            return;
        }
        checkoutModal.classList.add('active');
        // close cart to avoid focus conflicts
        closeCart();
        // mark modal as dialog and trap focus
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

    // Close Modal
    function closeCheckoutModal() {
        checkoutModal.classList.remove('active');
        // remove trap and attributes
        disableFocusTrap();
        try {
            checkoutModal.removeAttribute('role');
            checkoutModal.removeAttribute('aria-modal');
        } catch (e) { }
    }

    // Toggle Address Field
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

    // Toggle Change Field
    paymentSelect.addEventListener('change', (e) => {
        if (e.target.value === 'cash') {
            changeGroup.classList.remove('hidden');
        } else {
            changeGroup.classList.add('hidden');
            changeInput.value = '';
        }
    });

    // Validate checkout form
    function validateCheckoutForm() {
        const name = document.getElementById('client-name').value.trim();
        const phone = document.getElementById('client-phone') ? document.getElementById('client-phone').value.trim() : '';
        const deliveryType = document.querySelector('input[name="delivery-type"]:checked')?.value;
        const address = addressInput.value.trim();

        if (!VALIDATION.NAME.test(name)) {
            showToast('Nome inválido. Use 2-50 caracteres.', 'error');
            return false;
        }

        if (!deliveryType) {
            showToast('Selecione o tipo de entrega.', 'error');
            return false;
        }

        if (deliveryType === 'delivery' && !VALIDATION.ADDRESS.test(address)) {
            showToast('Endereço inválido. Informe corretamente.', 'error');
            return false;
        }

        // Validate phone if present (allow optional but warn if invalid)
        if (phone && !VALIDATION.PHONE.test(phone)) {
            showToast('Telefone inválido. Informe apenas números (10-11 dígitos).', 'error');
            return false;
        }

        return true;
    }

    // Handle Form Submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateCheckoutForm()) return;

        const name = document.getElementById('client-name').value.trim();
        const deliveryType = document.querySelector('input[name="delivery-type"]:checked').value;
        const address = addressInput.value.trim();
        const phone = document.getElementById('client-phone') ? document.getElementById('client-phone').value.trim() : '';
        const payment = paymentSelect.options[paymentSelect.selectedIndex].text;
        const change = changeInput.value.trim();

        // Build message safely
        let message = `Olá! Gostaria de fazer o seguinte pedido:\n\n`;
        message += `*Cliente:* ${name}\n`;
        message += `*Tipo:* ${deliveryType === 'delivery' ? 'Entrega 🛵' : 'Retirada 🏃'}\n`;

        if (deliveryType === 'delivery') {
            message += `*Endereço:* ${address}\n`;
        }

        if (phone) {
            message += `*Telefone:* ${phone}\n`;
        }

        message += `\n*Pedido:*\n`;
        cart.forEach(item => {
            const safeName = String(item.name).replace(/[<>"'&]/g, '');
            message += `${item.quantity}x ${safeName} - ${formatPrice(item.price * item.quantity)}\n`;
        });

        message += `\n*Total: ${formatPrice(calculateTotal())}*\n`;
        message += `*Pagamento:* ${payment}\n`;

        if (change && /^\d+[.,]?\d*$/.test(change)) {
            message += `*Troco para:* R$ ${change}\n`;
        }

        const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        closeCheckoutModal();
        // Clear without confirmation because this action follows an explicit user submit and may open a new tab
        clearCart(true); // Optional: clear cart after successful order
    });

    // Event listeners
    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeCheckoutModal);

    // Close modal on outside click
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) closeCheckoutModal();
    });

    // Add to cart buttons
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const menuItem = this.closest('.menu-item');
            const name = menuItem.dataset.name;
            const price = parseFloat(menuItem.dataset.price);
            const image = menuItem.dataset.image;

            addToCart(name, price, image);
        });
    });

    // ==========================================
    // MENU FILTERS
    // ==========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            menuItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'grid';
                    // Add animation
                    item.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Initial render
    renderCart();

    // Register service worker from external script (avoids inline script for CSP)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => console.log('SW registrado com sucesso:', registration.scope))
                .catch(err => console.warn('Falha ao registrar SW:', err));
        });
    }
});
