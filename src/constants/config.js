export const CONFIG = {
    WHATSAPP_NUMBER: '5583999578485',//(83) 99957-8485
    CART_STORAGE_KEY: 'cart',
    THEME_STORAGE_KEY: 'theme',
    MAX_CART_ITEMS: 99,
    TOAST_DURATION: 3000
};

export const VALIDATION = {
    NAME: /^[a-záàâãéèêíïóôõöúçñ\s]{2,50}$/i,
    // Endereço: mínimo 10 caracteres, aceita letras, números, vírgulas, pontos, hífens e espaços
    ADDRESS: /^[a-záàâãéèêíïóôõöúçñ0-9\s,.\-]{10,200}$/i,
    // Telefone brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX (com ou sem DDD)
    // Aceita também apenas números: 10 ou 11 dígitos (com DDD) ou 8 ou 9 dígitos (sem DDD)
    PHONE: /^(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[\s-]?\d{4}$/,
    // Telefone apenas números (para validação após remoção de formatação)
    PHONE_NUMBERS_ONLY: /^\d{10,11}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // Valor monetário: aceita R$, pontos, vírgulas e números
    MONEY: /^R?\$?\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)$/
};
