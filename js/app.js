// Controlador principal optimizado
class TiendaApp {
    constructor() {
        this.state = new AppState();
        this.jsonLoader = new JSONLoader();
        this.lazyLoader = new LazyImageLoader();
        this.renderer = new Renderer(this.state, this.lazyLoader);
        this.searchTimeout = null;
        this.isInitialized = false;
        this.productModalIndex = 0;
        this.productModalImages = [];
    }

    async init() {

        try {
            await this.loadProductsFromJSON();
            this.setupEventListeners();
            this.setupPriceRange();
            this.renderer.updateCartUI(); // Actualizar UI del carrito con datos guardados
            this.isInitialized = true;
        } catch (error) {
            console.error('Error inicializando la aplicación:', error);
            this.renderer.renderError(error.message);
        }
    }

    async loadProductsFromJSON() {
        try {
            const products = await this.jsonLoader.loadProducts();
            this.state.updateProducts(products);
            this.renderer.renderProducts();
            this.renderer.updatePriceRangeUI(this.state.maxPrice);
        } catch (error) {
            throw new Error(`No se pudo cargar el archivo productos.json. Asegúrate de que esté en la carpeta /data.`);
        }
    }

    // AGREGADO: Método para generar el mensaje de WhatsApp
    generateWhatsAppMessage() {
        if (this.state.cart.length === 0) {
            return '';
        }
        let message = "🛒 *NUEVO PEDIDO - TiendaOnline*\n\n";
        message += "📋 *DETALLE DEL PEDIDO:*\n";
        message += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
        this.state.cart.forEach((item, index) => {
            message += `*${index + 1}. ${item.title}*\n`;
            message += `   • Cantidad: ${item.quantity}\n`;
            message += `   • Precio unitario: ${item.price} Bs\n`;
            message += `   • Subtotal: ${(item.price * item.quantity).toFixed(2)} Bs\n\n`;
        });
        message += "━━━━━━━━━━━━━━━━━━━━━━\n";
        message += `*💰 TOTAL: ${this.state.getCartTotal().toFixed(2)} Bs*\n\n`;
        message += "📞 Por favor confirma tu pedido y coordina la entrega.";
        return message;
    }

    // AGREGADO: Método para enviar a WhatsApp
    sendToWhatsApp() {
        if (this.state.cart.length === 0) {
            this.renderer.showFeedbackMessage('El carrito está vacío');
            return;
        }

        const phoneNumber = '59176748058';
        const message = this.generateWhatsAppMessage();

        // SOLO codificar saltos de línea y asteriscos, NO los emojis
        const encodedMessage = message
            .replace(/\n/g, '%0A')  // Saltos de línea
            .replace(/\*/g, '%2A'); // Asteriscos para negritas

        const whatsappURL = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodedMessage}`;

        window.open(whatsappURL, '_blank');

        this.renderer.showFeedbackMessage('Enviando a WhatsApp...');

        setTimeout(() => {
            this.closeCart();
        }, 1500);
    }

    setupEventListeners() {
        // Búsqueda con debounce optimizado
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, CONFIG.SEARCH_DEBOUNCE);
        });

        // Filtros
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.handleSort(e.target.value);
        });

        // Pasar el event al handler de precio (corrección: antes usaba 'event' implícito)
        document.getElementById('priceMin').addEventListener('input', (e) => {
            this.handlePriceChange(e);
        });

        document.getElementById('priceMax').addEventListener('input', (e) => {
            this.handlePriceChange(e);
        });

        // Vista
        document.getElementById('gridViewBtn').addEventListener('click', () => {
            this.toggleView('grid');
        });

        document.getElementById('listViewBtn').addEventListener('click', () => {
            this.toggleView('list');
        });

        // Carrito
        document.getElementById('cartBtn').addEventListener('click', () => {
            this.openCart();
        });

        document.getElementById('closeCart').addEventListener('click', () => {
            this.closeCart();
        });

        document.getElementById('cartModal').addEventListener('click', (e) => {
            if (e.target.id === 'cartModal') this.closeCart();
        });

        // Modal de producto
        document.getElementById('productModal').addEventListener('click', (e) => {
            if (e.target.id === 'productModal') this.closeProductModal();
        });

        // Listener para el botón de cerrar del modal de producto
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.closeProductModal();
            });
        }

        // Delegación de eventos para productos y carrito
        document.getElementById('productsGrid').addEventListener('click', (e) => {
            const target = e.target;
            const card = target.closest('.product-card');
            if (!card) return;

            const productId = parseInt(card.dataset.id);

            if (target.classList.contains('add-to-cart') || target.closest('.add-to-cart')) {
                this.handleAddToCart(productId, target.closest('.add-to-cart') || target);
            } else if (target.classList.contains('view-product') || target.closest('.view-product') || target.closest('.product-image') || target.closest('.product-title')) {
                this.openProductModal(productId);
            }
        });

        document.getElementById('cartItems').addEventListener('click', (e) => {
            const target = e.target;
            const btn = target.closest('button');
            if (!btn) return;

            const productId = parseInt(btn.dataset.id);

            if (btn.classList.contains('qty-increase')) {
                this.state.updateCartQuantity(productId, 1);
            } else if (btn.classList.contains('qty-decrease')) {
                this.state.updateCartQuantity(productId, -1);
            } else if (btn.classList.contains('remove-item') || btn.closest('.remove-item')) {
                this.state.removeFromCart(productId);
            }

            this.renderer.updateCartUI();
            this.renderer.renderCart();
        });

        // Modal Add to Cart
        const modalAddToCartBtn = document.getElementById('modalAddToCart');
        if (modalAddToCartBtn) {
            modalAddToCartBtn.addEventListener('click', () => {
                // Si el botón está en estado "Ver Carrito", abrir el carrito
                if (modalAddToCartBtn.classList.contains('view-cart-state')) {
                    this.closeProductModal();
                    this.openCart();
                    return;
                }

                // Obtener el ID del producto actual desde el modal
                // Como no guardamos el ID en el modal directamente, podemos buscarlo por título o guardar el ID al abrir
                // Mejor: guardar el ID actual en la instancia
                if (this.currentProductId) {
                    this.handleAddToCart(this.currentProductId, modalAddToCartBtn);
                }
            });
        }

        // Theme Toggle
        const themeToggle = document.getElementById('themeToggle');
        const themeLabel = document.getElementById('themeLabel');

        const updateThemeLabel = (theme) => {
            if (theme === 'dark') {
                themeLabel.textContent = 'Modo Claro';
            } else {
                themeLabel.textContent = 'Modo Oscuro';
            }
        };

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeLabel(newTheme);
        });

        // Cargar tema guardado
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeLabel(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateThemeLabel('dark');
        }

        // Sidebar Toggle (Mobile)
        const filterToggleBtn = document.getElementById('filterToggleBtn');
        const closeSidebarBtn = document.getElementById('closeSidebar');
        const sidebar = document.querySelector('.sidebar');

        if (filterToggleBtn) {
            filterToggleBtn.addEventListener('click', () => {
                sidebar.classList.add('active');
            });
        }

        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        }

        // Cerrar sidebar al hacer click fuera en móvil
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) &&
                !filterToggleBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });

        // Carrusel Modal Event Listeners
        const prevBtn = document.getElementById('modalPrevBtn');
        const nextBtn = document.getElementById('modalNextBtn');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateModalCarousel(-1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateModalCarousel(1);
            });
        }
    }

    setupPriceRange() {
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const rangeFill = document.getElementById('rangeFill');

        const updateRangeFill = () => {
            const minVal = parseInt(priceMin.value);
            const maxVal = parseInt(priceMax.value);
            const max = parseInt(priceMax.max) || 1000;

            const minPercent = (minVal / max) * 100;
            const maxPercent = (maxVal / max) * 100;

            rangeFill.style.left = minPercent + '%';
            rangeFill.style.width = (maxPercent - minPercent) + '%';
        };

        // Inicializar
        updateRangeFill();

        // Observer para cambios en los atributos max
        const observer = new MutationObserver(updateRangeFill);
        observer.observe(priceMax, { attributes: true });

        priceMin.addEventListener('input', updateRangeFill);
        priceMax.addEventListener('input', updateRangeFill);
    }

    handleSearch(query) {
        this.state.searchQuery = query;
        this.state.currentPage = 1;
        this.state.applyFilters();
        this.renderer.renderProducts();
    }

    handleSort(value) {
        this.state.sortBy = value;
        this.state.applyFilters();
        this.renderer.renderProducts();
    }

    handlePriceChange(e) {
        const min = parseInt(document.getElementById('priceMin').value);
        const max = parseInt(document.getElementById('priceMax').value);

        if (min > max) {
            // Evitar cruce
            if (e.target.id === 'priceMin') {
                document.getElementById('priceMin').value = max;
            } else {
                document.getElementById('priceMax').value = min;
            }
        }

        this.state.priceRange = {
            min: parseInt(document.getElementById('priceMin').value),
            max: parseInt(document.getElementById('priceMax').value)
        };

        document.getElementById('minPriceLabel').textContent = `${this.state.priceRange.min} Bs`;
        document.getElementById('maxPriceLabel').textContent = `${this.state.priceRange.max} Bs`;

        this.state.currentPage = 1;
        this.state.applyFilters();
        this.renderer.renderProducts();
    }

    toggleView(view) {
        this.state.currentView = view;
        const productsGrid = document.getElementById('productsGrid');
        const gridBtn = document.getElementById('gridViewBtn');
        const listBtn = document.getElementById('listViewBtn');

        if (view === 'grid') {
            productsGrid.classList.remove('list-view');
            productsGrid.classList.add('grid-view');
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        } else {
            productsGrid.classList.remove('grid-view');
            productsGrid.classList.add('list-view');
            gridBtn.classList.remove('active');
            listBtn.classList.add('active');
        }
    }

    handleAddToCart(productId, button) {
        this.state.addToCart(productId);
        this.renderer.updateCartUI();
        this.renderer.showAddToCartFeedback(button);
    }

    openCart() {
        const cartModal = document.getElementById('cartModal');
        cartModal.style.display = 'block';
        this.renderer.renderCart();
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        const cartModal = document.getElementById('cartModal');
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    openProductModal(productId) {
        const product = this.state.allProducts.find(p => p.id === productId);
        if (!product) return;

        // Resetear botón de agregar al carrito
        const addToCartBtn = document.getElementById('modalAddToCart');
        if (addToCartBtn) {
            addToCartBtn.innerHTML = 'Agregar al Carrito';
            addToCartBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            addToCartBtn.classList.remove('view-cart-state');
        }

        this.currentProductId = productId; // Guardar ID actual

        document.getElementById('modalTitle').textContent = product.title;
        document.getElementById('modalPrice').textContent = `${product.price} Bs`;
        document.getElementById('modalDescription').textContent = product.description;

        // Configurar carrusel
        this.productModalImages = product.images && product.images.length > 0 ? product.images : [product.mainImage];
        this.productModalIndex = 0;

        this.updateModalImage();
        this.renderModalThumbnails();

        // Mostrar/ocultar controles si hay solo una imagen
        const prevBtn = document.getElementById('modalPrevBtn');
        const nextBtn = document.getElementById('modalNextBtn');
        const dotsContainer = document.getElementById('modalCarouselDots');

        if (this.productModalImages.length > 1) {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
            dotsContainer.style.display = 'flex';
            this.renderModalDots();
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            dotsContainer.style.display = 'none';
        }

        const modal = document.getElementById('productModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeProductModal() {
        const modal = document.getElementById('productModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentProductId = null;
    }

    navigateModalCarousel(direction) {
        this.productModalIndex += direction;

        if (this.productModalIndex < 0) {
            this.productModalIndex = this.productModalImages.length - 1;
        } else if (this.productModalIndex >= this.productModalImages.length) {
            this.productModalIndex = 0;
        }

        this.updateModalImage();
        this.updateModalDots();
        this.updateModalThumbnails();
    }

    setModalImage(index) {
        this.productModalIndex = index;
        this.updateModalImage();
        this.updateModalDots();
        this.updateModalThumbnails();
    }

    updateModalImage() {
        const mainImage = document.getElementById('modalMainImage');
        mainImage.style.opacity = '0';

        setTimeout(() => {
            mainImage.src = this.productModalImages[this.productModalIndex];
            mainImage.style.opacity = '1';
        }, 200);
    }

    renderModalThumbnails() {
        const container = document.getElementById('modalThumbnails');
        container.innerHTML = '';

        if (this.productModalImages.length <= 1) return;

        this.productModalImages.forEach((src, index) => {
            const img = document.createElement('img');
            img.src = src;
            img.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            img.onclick = () => this.setModalImage(index);
            container.appendChild(img);
        });
    }

    updateModalThumbnails() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, index) => {
            if (index === this.productModalIndex) {
                thumb.classList.add('active');
                thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                thumb.classList.remove('active');
            }
        });
    }

    renderModalDots() {
        const container = document.getElementById('modalCarouselDots');
        container.innerHTML = '';

        this.productModalImages.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.onclick = (e) => {
                e.stopPropagation();
                this.setModalImage(index);
            };
            container.appendChild(dot);
        });
    }

    updateModalDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index === this.productModalIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    goToPage(page) {
        this.state.currentPage = page;
        this.state.updateDisplayedProducts();
        this.renderer.renderProducts();
        // Scroll al inicio de la lista de productos
        document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Inicialización
const app = new TiendaApp();
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
