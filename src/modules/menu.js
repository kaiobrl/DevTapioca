import { MENU_DATA } from '../data/menuData.js';
import { formatPrice } from '../utils/helpers.js';
import { addToCart } from './cart.js';

const menuGrid = document.querySelector('.menu-grid');
const filterBtns = document.querySelectorAll('.filter-btn');

export function renderMenu(filter = 'all') {
    if (!menuGrid) return;

    menuGrid.innerHTML = '';

    const filteredItems = MENU_DATA.filter(item => filter === 'all' || item.category === filter);

    filteredItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'menu-item';
        li.dataset.category = item.category;
        li.dataset.name = item.name;
        li.dataset.price = item.price;
        li.dataset.image = item.image;
        
        li.style.animation = 'fadeIn 0.5s ease forwards';

        const badgeHtml = item.badge ? `<span class="badge ${item.badgeClass || ''}">${item.badge}</span>` : '';

        li.innerHTML = `
            <img loading="lazy" src="${item.image}" alt="${item.name}" />
            ${badgeHtml}
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <strong>${formatPrice(item.price)}</strong>
            <button class="btn add-to-cart">Adicionar ao Carrinho</button>
        `;

        const addBtn = li.querySelector('.add-to-cart');
        addBtn.addEventListener('click', () => {
            addToCart(item.name, item.price, item.image);
        });

        menuGrid.appendChild(li);
    });
}

export function initMenu() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            renderMenu(filterValue);
        });
    });

    renderMenu();
}
