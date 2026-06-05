import { CONFIG } from '../constants/config.js';

export function initMobileMenu() {
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

        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        document.addEventListener('click', function (e) {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

export function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem(CONFIG.THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');

    function applyTheme(t) {
        if (t === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            themeBtn.textContent = '☀️';
            themeBtn.setAttribute('aria-pressed', 'true');
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
        applyTheme(currentTheme);
        themeBtn.addEventListener('click', function () {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            const next = isDark ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem(CONFIG.THEME_STORAGE_KEY, next);
        });
    }
}
