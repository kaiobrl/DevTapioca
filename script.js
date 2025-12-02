document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);

    window.showToast = function (message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${type === 'success' ? '✅' : '⚠️'}</span>
            <p>${message}</p>
        `;

        toastContainer.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
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
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');

    function applyTheme(t) {
        if (t === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            themeBtn.textContent = '☀️';
            themeBtn.setAttribute('aria-pressed', 'true');
        } else {
            document.body.removeAttribute('data-theme');
            themeBtn.textContent = '🌙';
            themeBtn.setAttribute('aria-pressed', 'false');
        }
    }

    if (themeBtn) {
        applyTheme(initTheme);
        themeBtn.addEventListener('click', function () {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            const next = isDark ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('theme', next);
        });
    }

    // ==========================================
    // SHOPPING CART
    // ==========================================
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

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
    }

    // Close cart
    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
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

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Render cart items
    function renderCart() {
        if (cart.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.style.display = 'none';
            cartTotalPrice.textContent = formatPrice(0);
            updateCartCount();
            return;
        }

        cartEmpty.style.display = 'none';
        cartItems.style.display = 'block';

        cartItems.innerHTML = cart.map((item, index) => `
            <li class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn qty-minus" data-index="${index}" aria-label="Diminuir quantidade">−</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn qty-plus" data-index="${index}" aria-label="Aumentar quantidade">+</button>
                </div>
                <button class="cart-item-remove" data-index="${index}" aria-label="Remover item">🗑️</button>
            </li>
        `).join('');

        // Add event listeners to quantity buttons
        document.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', () => decreaseQuantity(parseInt(btn.dataset.index)));
        });

        document.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', () => increaseQuantity(parseInt(btn.dataset.index)));
        });

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => removeItem(parseInt(btn.dataset.index)));
        });

        cartTotalPrice.textContent = formatPrice(calculateTotal());
        updateCartCount();
    }

    // Add item to cart
    function addToCart(name, price, image) {
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity++;
            showToast(`Mais uma unidade de <b>${name}</b> adicionada!`);
        } else {
            cart.push({ name, price, image, quantity: 1 });
            showToast(`<b>${name}</b> adicionado ao carrinho!`);
        }

        saveCart();
        renderCart();
        openCart();
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
        if (cart[index].quantity < 99) {
            cart[index].quantity++;
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

    // Clear cart
    function clearCart() {
        if (confirm('Tem certeza que deseja limpar o carrinho?')) {
            cart = [];
            saveCart();
            renderCart();
            showToast('Carrinho limpo com sucesso!', 'success');
        }
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
        closeCart();
    }

    // Close Modal
    function closeCheckoutModal() {
        checkoutModal.classList.remove('active');
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

    // Handle Form Submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('client-name').value;
        const deliveryType = document.querySelector('input[name="delivery-type"]:checked').value;
        const address = addressInput.value;
        const payment = paymentSelect.options[paymentSelect.selectedIndex].text;
        const change = changeInput.value;

        let message = `Olá! Gostaria de fazer o seguinte pedido:\n\n`;
        message += `*Cliente:* ${name}\n`;
        message += `*Tipo:* ${deliveryType === 'delivery' ? 'Entrega 🛵' : 'Retirada 🏃'}\n`;

        if (deliveryType === 'delivery') {
            message += `*Endereço:* ${address}\n`;
        }

        message += `\n*Pedido:*\n`;
        cart.forEach(item => {
            message += `${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}\n`;
        });

        message += `\n*Total: ${formatPrice(calculateTotal())}*\n`;
        message += `*Pagamento:* ${payment}\n`;

        if (change) {
            message += `*Troco para:* ${change}\n`;
        }

        const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        closeCheckoutModal();
        clearCart(); // Optional: clear cart after successful order
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
});
