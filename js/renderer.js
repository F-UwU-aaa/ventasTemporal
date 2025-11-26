// Renderizador optimizado
class Renderer {
    constructor(appState, lazyLoader) {
        this.state = appState;
        this.lazyLoader = lazyLoader;
        this.productsGrid = document.getElementById('productsGrid');
        this.productsCount = document.getElementById('productsCount');
        this.pagination = document.getElementById('pagination');
        this.cartCount = document.getElementById('cartCount');
        this.cartItems = document.getElementById('cartItems');
        this.totalAmount = document.getElementById('totalAmount');
    }

    renderProducts() {
        if (this.state.displayedProducts.length === 0) {
            this.renderNoResults();
            return;
        }

        // Usar DocumentFragment para mejor rendimiento
        const fragment = document.createDocumentFragment();

        this.state.displayedProducts.forEach(product => {
            const productElement = this.createProductElement(product);
            fragment.appendChild(productElement);
        });

        // Una sola operación DOM
        this.productsGrid.innerHTML = '';
        this.productsGrid.appendChild(fragment);

        this.updateProductsCount();
        this.renderPagination();
    }

    createProductElement(product) {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.dataset.id = product.id;
        // Solo imagen principal, sin carrusel ni controles
        const imageHTML = `
            <div class="product-image">
                <img src="${product.mainImage}"
                     alt="${product.title}">
            </div>
        `;
        div.innerHTML = `
            ${imageHTML}
            <div class="product-info">
                <div class="product-details">
                    <h3 class="product-title">${product.title}</h3>
                </div>
                <div class="product-footer">
                    <div class="product-price">${product.price} Bs</div>
                </div>
            </div>
        `;
        return div;
    }

    renderNoResults() {
        this.productsGrid.innerHTML = `
            <div class="no-results">
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar los filtros o buscar algo diferente.</p>
            </div>
        `;
        this.pagination.innerHTML = '';
    }

    renderError(message) {
        this.productsGrid.innerHTML = `
            <div class="error-message">
                <h3>Error al cargar productos</h3>
                <p>${message}</p>
                <button onclick="location.reload()">
                    Reintentar
                </button>
            </div>
        `;
    }

    updateProductsCount() {
        this.productsCount.textContent = `${this.state.filteredProducts.length} productos encontrados`;
    }

    renderPagination() {
        if (this.state.totalPages <= 1) {
            this.pagination.innerHTML = '';
            return;
        }

        const currentPage = this.state.currentPage;
        const totalPages = this.state.totalPages;

        let paginationHTML = '';

        // Botón anterior
        paginationHTML += `
            <button ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="app.goToPage(${currentPage - 1})">
                ‹ Anterior
            </button>
        `;

        // Números de página (máximo 7 páginas visibles)
        let startPage = Math.max(1, currentPage - 3);
        let endPage = Math.min(totalPages, startPage + 6);

        if (endPage - startPage < 6) {
            startPage = Math.max(1, endPage - 6);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="${i === currentPage ? 'active' : ''}" 
                        onclick="app.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        // Botón siguiente
        paginationHTML += `
            <button ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="app.goToPage(${currentPage + 1})">
                Siguiente ›
            </button>
        `;

        this.pagination.innerHTML = paginationHTML;
    }

    updateCartUI() {
        const itemCount = this.state.getCartItemCount();
        this.cartCount.textContent = itemCount;
        this.cartCount.style.display = itemCount > 0 ? 'flex' : 'none';
    }

    renderCart() {
        if (this.state.cart.length === 0) {
            this.cartItems.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #667eea;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.5; margin-bottom: 1rem;">
                        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                    <p style="font-size: 1.2rem; font-weight: 600;">Tu carrito está vacío</p>
                    <p style="opacity: 0.7; margin-top: 0.5rem;">Agrega algunos productos para comenzar</p>
                </div>
            `;
            this.totalAmount.textContent = '0 Bs';
            return;
        }

        const cartHTML = this.state.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.mainImage}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${item.price} Bs</div>
                    <div class="cart-quantity">
                        <button class="qty-btn qty-decrease" data-id="${item.id}">-</button>
                        <span style="min-width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
                        <button class="qty-btn qty-increase" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}" 
                                style="margin-left: 1rem; color: #ff4757; background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: all 0.3s ease;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.cartItems.innerHTML = cartHTML;
        this.totalAmount.textContent = this.state.getCartTotal().toFixed(2) + ' Bs';
    }

    showAddToCartFeedback(button) {
        // Cambiar a estado "Ver Carrito"
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            <span style="color: white; margin-left: 8px;">Ver Carrito</span>
        `;
        button.style.background = 'linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%)';
        button.classList.add('view-cart-state');

        // Mostrar mensaje de retroalimentación
        this.showFeedbackMessage('Producto agregado al carrito');
    }

    showFeedbackMessage(message, title = 'Notificación') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';

        toast.innerHTML = `
            <img src="Imagenes_Marca/favicon.png" alt="Icono" class="toast-icon">
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;

        container.appendChild(toast);

        // Remover después de 3 segundos
        setTimeout(() => {
            toast.classList.add('hide');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 3000);
    }

    updatePriceRangeUI(maxPrice) {
        // Actualizar los controles de precio
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');

        if (typeof maxPrice !== 'undefined') {
            priceMin.max = maxPrice;
            priceMax.max = maxPrice;
            priceMax.value = maxPrice;
            document.getElementById('maxPriceLabel').textContent = `${maxPrice} Bs`;
        }
    }
}
