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
        
        // ===== ZOOM Y PAN VARIABLES =====
        this.zoomScale = 1;
        this.minZoom = 1;
        this.maxZoom = 4;
        
        // Pan (desplazamiento)
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.lastPanX = 0;
        this.lastPanY = 0;
        
        // Dimensiones de imagen para cálculo de límites
        this.imgWidth = 0;
        this.imgHeight = 0;
        this.containerWidth = 0;
        this.containerHeight = 0;
        
        // Animación de bounce back
        this.isAnimating = false;
    }

    async init() {
        this.renderer.renderSkeletons();
        this.setupHistoryHandling(); // Configurar manejo de historial
        this.setupCarouselTouchHandling(); // Configurar gestos táctiles
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

    // AGREGADO: Manejo del botón "Atrás"
    setupHistoryHandling() {
        window.addEventListener('popstate', (event) => {
            const state = event.state;

            // Cerrar todo primero (limpieza)
            this._hideCart();
            this._hideProductModal();
            this._hideSidebar();

            // Restaurar estado si existe
            if (state) {
                if (state.modal === 'cart') {
                    this._showCart();
                } else if (state.modal === 'product' && state.productId) {
                    this._showProductModal(state.productId);
                } else if (state.modal === 'sidebar') {
                    this._showSidebar();
                }
            }
        });
    }

    // AGREGADO: Soporte para Swipe en Carrusel
    setupCarouselTouchHandling() {
        const carousel = document.getElementById('modalCarousel');
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipeGesture(touchStartX, touchEndX);
        }, { passive: true });
    }

    handleSwipeGesture(startX, endX) {
        const threshold = 50; // Mínimo desplazamiento para considerar swipe
        if (startX - endX > threshold) {
            // Deslizó a la izquierda -> Siguiente
            this.navigateModalCarousel(1);
        } else if (endX - startX > threshold) {
            // Deslizó a la derecha -> Anterior
            this.navigateModalCarousel(-1);
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
            this.closeCart(); // Usar el método público que maneja historial
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
                    this.closeProductModal(); // Cierra producto (history.back)
                    // Esperar un poco para abrir el carrito para que no colisionen las animaciones/historial
                    setTimeout(() => this.openCart(), 50);
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
                this.openSidebar();
            });
        }

        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // Cerrar sidebar al hacer click fuera en móvil
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) &&
                !filterToggleBtn.contains(e.target)) {
                this.closeSidebar();
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

        // ===== ZOOM IMAGE VIEWERS =====
        const modalMainImage = document.getElementById('modalMainImage');
        const imageZoom = document.getElementById('imageZoom');
        const imageZoomImg = document.getElementById('imageZoomImg');
        const imageZoomWrapper = imageZoomImg?.parentElement;
        const imageZoomClose = document.getElementById('imageZoomClose');
        const imageZoomIn = document.getElementById('imageZoomIn');
        const imageZoomOut = document.getElementById('imageZoomOut');
        const imageZoomReset = document.getElementById('imageZoomReset');

        // Abrir visor de zoom
        if (modalMainImage) {
            modalMainImage.addEventListener('click', () => {
                imageZoomImg.src = modalMainImage.src;
                imageZoom.classList.add('show');
                this.resetZoomState();
                this.updateZoom();
                
                // Calcular dimensiones de la imagen después de cargar
                setTimeout(() => {
                    this.calculateImageDimensions();
                }, 100);
            });
        }

        // Cerrar zoom
        if (imageZoomClose) {
            imageZoomClose.addEventListener('click', () => {
                this.closeZoomViewer(imageZoom);
            });
        }

        if (imageZoom) {
            imageZoom.addEventListener('click', (e) => {
                if (e.target === imageZoom || e.target === imageZoomWrapper) {
                    this.closeZoomViewer(imageZoom);
                }
            });
        }

        // Botones de zoom
        if (imageZoomIn) {
            imageZoomIn.addEventListener('click', () => {
                this.zoomLevel(0.5);
            });
        }

        if (imageZoomOut) {
            imageZoomOut.addEventListener('click', () => {
                this.zoomLevel(-0.5);
            });
        }

        if (imageZoomReset) {
            imageZoomReset.addEventListener('click', () => {
                this.resetZoomState();
                this.updateZoom();
            });
        }

        // Rueda del ratón - Zoom
        if (imageZoomImg) {
            imageZoomImg.addEventListener('wheel', (e) => {
                e.preventDefault();
                if (e.deltaY < 0) {
                    // Scroll arriba = Acercar
                    this.zoomLevel(0.05);
                } else {
                    // Scroll abajo = Alejar
                    this.zoomLevel(-0.05);
                }
            }, { passive: false });

            // ===== PREVENIR ARRASTRES NATIVOS DE LA IMAGEN =====
            imageZoomImg.addEventListener('dragstart', (e) => {
                e.preventDefault();
                return false;
            });

            imageZoomImg.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });

            // ===== MOUSE DRAG =====
            imageZoomImg.addEventListener('mousedown', (e) => {
                // CRÍTICO: Prevenir comportamiento por defecto del navegador
                e.preventDefault();
                e.stopPropagation();
                
                if (this.zoomScale > this.minZoom) {
                    this.startDrag(e.clientX, e.clientY, imageZoomWrapper);
                }
                return false;
            });

            document.addEventListener('mousemove', (e) => {
                if (this.isDragging) {
                    e.preventDefault();
                    this.performDrag(e.clientX, e.clientY);
                }
            });

            document.addEventListener('mouseup', (e) => {
                if (this.isDragging) {
                    e.preventDefault();
                    this.endDrag(imageZoomImg);
                }
            });

            // ===== PREVENIR DROP EN EL CONTENEDOR =====
            const imageZoomContainer = imageZoomImg.closest('.image-zoom');
            if (imageZoomContainer) {
                imageZoomContainer.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    return false;
                });

                imageZoomContainer.addEventListener('drop', (e) => {
                    e.preventDefault();
                    return false;
                });
            }

            // ===== TOUCH SUPPORT =====
            imageZoomImg.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1 && this.zoomScale > this.minZoom) {
                    // Un dedo - arrastrar
                    this.startDrag(e.touches[0].clientX, e.touches[0].clientY, imageZoomWrapper);
                } else if (e.touches.length === 2) {
                    // Dos dedos - pinch zoom
                    this.lastTouchDistance = this.getDistance(e.touches[0], e.touches[1]);
                }
            }, { passive: true });

            document.addEventListener('touchmove', (e) => {
                if (this.isDragging && e.touches.length === 1) {
                    e.preventDefault();
                    this.performDrag(e.touches[0].clientX, e.touches[0].clientY);
                } else if (e.touches.length === 2) {
                    e.preventDefault();
                    const distance = this.getDistance(e.touches[0], e.touches[1]);
                    const scale = distance / (this.lastTouchDistance || distance);
                    
                    if (scale > 1.05) {
                        this.zoomLevel(0.05);
                        this.lastTouchDistance = distance;
                    } else if (scale < 0.95) {
                        this.zoomLevel(-0.05);
                        this.lastTouchDistance = distance;
                    }
                }
            }, { passive: false });

            document.addEventListener('touchend', () => {
                if (this.isDragging) {
                    this.endDrag(imageZoomImg);
                }
                this.lastTouchDistance = 0;
            });
        }

        // ===== KEYBOARD SHORTCUTS =====
        document.addEventListener('keydown', (e) => {
            if (imageZoom?.classList.contains('show')) {
                if (e.key === 'Escape') {
                    this.closeZoomViewer(imageZoom);
                } else if (e.key === '+' || e.key === '=') {
                    this.zoomLevel(0.5);
                } else if (e.key === '-') {
                    this.zoomLevel(-0.5);
                } else if (e.key === '0') {
                    this.resetZoomState();
                    this.updateZoom();
                }
            }
        });
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

    // --- MÉTODOS PÚBLICOS (Con Historial) ---

    openCart() {
        history.pushState({ modal: 'cart' }, '', '');
        this._showCart();
    }

    closeCart() {
        // Si hay historial y es nuestro modal, volvemos atrás
        if (history.state && history.state.modal === 'cart') {
            history.back();
        } else {
            // Fallback por si acaso (ej: recarga de página con modal abierto, aunque init lo cierra)
            this._hideCart();
        }
    }

    openProductModal(productId) {
        history.pushState({ modal: 'product', productId: productId }, '', '');
        this._showProductModal(productId);
    }

    closeProductModal() {
        if (history.state && history.state.modal === 'product') {
            history.back();
        } else {
            this._hideProductModal();
        }
    }

    openSidebar() {
        history.pushState({ modal: 'sidebar' }, '', '');
        this._showSidebar();
    }

    closeSidebar() {
        if (history.state && history.state.modal === 'sidebar') {
            history.back();
        } else {
            this._hideSidebar();
        }
    }

    // --- MÉTODOS PRIVADOS (Solo UI) ---

    _showCart() {
        const cartModal = document.getElementById('cartModal');
        cartModal.style.display = 'block';
        this.renderer.renderCart();
        document.body.style.overflow = 'hidden';
    }

    _hideCart() {
        const cartModal = document.getElementById('cartModal');
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    _showProductModal(productId) {
        const product = this.state.allProducts.find(p => p.id === productId);
        if (!product) return;

        // Resetear botón de agregar al carrito
        const addToCartBtn = document.getElementById('modalAddToCart');
        if (addToCartBtn) {
            addToCartBtn.innerHTML = 'Comprar Ahora';
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

    _hideProductModal() {
        const modal = document.getElementById('productModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentProductId = null;
    }

    _showSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.add('active');
    }

    _hideSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('active');
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

    updateZoom() {
        const imageZoomImg = document.getElementById('imageZoomImg');
        const imageZoomLevel = document.getElementById('imageZoomLevel');
        const imageZoomWrapper = imageZoomImg?.parentElement;

        if (imageZoomImg) {
            // Aplicar transformación: escala + desplazamiento
            imageZoomImg.style.transform = `scale(${this.zoomScale}) translate(${this.panX / this.zoomScale}px, ${this.panY / this.zoomScale}px)`;
        }

        if (imageZoomLevel) {
            imageZoomLevel.textContent = Math.round(this.zoomScale * 100) + '%';
        }

        // Actualizar clase de cursor basado en zoom
        if (imageZoomWrapper) {
            if (this.zoomScale > 1) {
                imageZoomWrapper.classList.remove('no-drag');
            } else {
                imageZoomWrapper.classList.add('no-drag');
            }
        }
    }

    // ===== MÉTODOS DE ZOOM =====

    /**
     * Ajusta el nivel de zoom
     * @param {number} delta - Cantidad a sumar/restar al zoom (positivo = acercar, negativo = alejar)
     */
    zoomLevel(delta) {
        const newZoom = this.zoomScale + delta;
        this.zoomScale = Math.max(this.minZoom, Math.min(newZoom, this.maxZoom));
        this.constrainPan(); // Limitar pan después de cambiar zoom
        this.updateZoom();
    }

    /**
     * Reinicia zoom y pan al estado inicial
     */
    resetZoomState() {
        this.zoomScale = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.isAnimating = false;
    }

    /**
     * Cierra el visor de zoom
     */
    closeZoomViewer(imageZoom) {
        imageZoom.classList.remove('show');
        this.resetZoomState();
        this.updateZoom();
    }

    // ===== MÉTODOS DE ARRASTRE (PAN) =====

    /**
     * Calcula dimensiones de la imagen para cálculos de límites
     */
    calculateImageDimensions() {
        const imageZoomImg = document.getElementById('imageZoomImg');
        const imageZoomWrapper = imageZoomImg?.parentElement;

        if (imageZoomImg && imageZoomWrapper) {
            // Obtener dimensiones reales de la imagen
            this.imgWidth = imageZoomImg.offsetWidth;
            this.imgHeight = imageZoomImg.offsetHeight;
            this.containerWidth = imageZoomWrapper.offsetWidth;
            this.containerHeight = imageZoomWrapper.offsetHeight;
        }
    }

    /**
     * Inicia el arrastre de la imagen
     */
    startDrag(clientX, clientY, wrapper) {
        if (this.isAnimating) return;

        this.isDragging = true;
        this.dragStartX = clientX;
        this.dragStartY = clientY;
        this.lastPanX = this.panX;
        this.lastPanY = this.panY;

        const imageZoomImg = document.getElementById('imageZoomImg');
        if (imageZoomImg) {
            imageZoomImg.classList.add('dragging');
        }
        if (wrapper) {
            wrapper.classList.add('dragging');
        }
    }

    /**
     * Realiza el arrastre en tiempo real
     */
    performDrag(clientX, clientY) {
        if (!this.isDragging || this.zoomScale <= 1) return;

        // Calcular delta desde el inicio del arrastre
        const deltaX = clientX - this.dragStartX;
        const deltaY = clientY - this.dragStartY;

        // Aplicar movimiento
        this.panX = this.lastPanX + deltaX;
        this.panY = this.lastPanY + deltaY;

        // Limitar el pan dentro de los límites calculados
        this.constrainPan();

        // Actualizar imagen sin transición (inmediato)
        this.updateZoomImmediate();
    }

    /**
     * Finaliza el arrastre
     */
    endDrag(imageZoomImg) {
        this.isDragging = false;

        if (imageZoomImg) {
            imageZoomImg.classList.remove('dragging');
        }

        // Verificar si está fuera de límites y hacer bounce back
        if (this.isPanOutOfBounds()) {
            this.animateBounceBack();
        }
    }

    /**
     * Limita el pan a los límites permitidos
     * Calcula correctamente basándose en: tamaño imagen ampliada vs contenedor
     * FÓRMULA:
     * - Obtener tamaño de imagen con zoom aplicado
     * - Obtener tamaño del contenedor
     * - Calcular cuánto sobresale = (imagen_ampliada - contenedor) / 2
     * - Límite final = sobresale + buffer (15% del contenedor)
     */
    constrainPan() {
        if (this.zoomScale <= 1) {
            this.panX = 0;
            this.panY = 0;
            return;
        }

        // ===== CÁLCULO CORRECTO DE LÍMITES =====
        
        // Tamaño de la imagen CON zoom aplicado
        const scaledImgWidth = this.imgWidth * this.zoomScale;
        const scaledImgHeight = this.imgHeight * this.zoomScale;

        // Cuánto sobresale la imagen ampliada del contenedor (por lado)
        const overflowX = Math.max(0, (scaledImgWidth - this.containerWidth) / 2);
        const overflowY = Math.max(0, (scaledImgHeight - this.containerHeight) / 2);

        // Buffer adicional: permitir que se salga un 15% extra del contenedor
        const bufferX = this.containerWidth * 0.15;
        const bufferY = this.containerHeight * 0.15;

        // Límites finales: cuánto podemos mover la imagen
        const maxPanX = overflowX + bufferX;
        const maxPanY = overflowY + bufferY;

        // Aplicar límites simétricos (negativo y positivo)
        this.panX = Math.max(-maxPanX, Math.min(this.panX, maxPanX));
        this.panY = Math.max(-maxPanY, Math.min(this.panY, maxPanY));
    }

    /**
     * Verifica si el pan está fuera de los límites permitidos
     * Usa la misma lógica de cálculo que constrainPan
     */
    isPanOutOfBounds() {
        if (this.zoomScale <= 1) return false;

        // Usar la misma fórmula que en constrainPan
        const scaledImgWidth = this.imgWidth * this.zoomScale;
        const scaledImgHeight = this.imgHeight * this.zoomScale;
        
        const overflowX = Math.max(0, (scaledImgWidth - this.containerWidth) / 2);
        const overflowY = Math.max(0, (scaledImgHeight - this.containerHeight) / 2);
        
        const bufferX = this.containerWidth * 0.15;
        const bufferY = this.containerHeight * 0.15;
        
        const maxPanX = overflowX + bufferX;
        const maxPanY = overflowY + bufferY;

        return Math.abs(this.panX) > maxPanX || Math.abs(this.panY) > maxPanY;
    }

    /**
     * Anima el regreso a los límites permitidos (bounce back)
     * Si se arrastra fuera de los límites, vuelve suavemente
     */
    animateBounceBack() {
        this.isAnimating = true;
        const startPanX = this.panX;
        const startPanY = this.panY;

        // Calcular límites correctos usando la misma fórmula
        const scaledImgWidth = this.imgWidth * this.zoomScale;
        const scaledImgHeight = this.imgHeight * this.zoomScale;
        
        const overflowX = Math.max(0, (scaledImgWidth - this.containerWidth) / 2);
        const overflowY = Math.max(0, (scaledImgHeight - this.containerHeight) / 2);
        
        const bufferX = this.containerWidth * 0.15;
        const bufferY = this.containerHeight * 0.15;
        
        const maxPanX = overflowX + bufferX;
        const maxPanY = overflowY + bufferY;

        // Constrain a los límites permitidos
        const endPanX = Math.max(-maxPanX, Math.min(this.panX, maxPanX));
        const endPanY = Math.max(-maxPanY, Math.min(this.panY, maxPanY));

        const duration = 400; // ms
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing: ease-out-cubic para animación suave
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            this.panX = startPanX + (endPanX - startPanX) * easeProgress;
            this.panY = startPanY + (endPanY - startPanY) * easeProgress;

            this.updateZoomImmediate();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                this.panX = endPanX;
                this.panY = endPanY;
                this.updateZoom();
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Actualiza la imagen inmediatamente sin transición (para arrastre fluido)
     */
    updateZoomImmediate() {
        const imageZoomImg = document.getElementById('imageZoomImg');

        if (imageZoomImg) {
            imageZoomImg.style.transform = `scale(${this.zoomScale}) translate(${this.panX / this.zoomScale}px, ${this.panY / this.zoomScale}px)`;
        }
    }

    /**
     * Calcula distancia entre dos puntos de toque (para pinch zoom)
     */
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// Inicialización
const app = new TiendaApp();
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
