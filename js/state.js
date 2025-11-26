// Estado de la aplicación
class AppState {
    constructor() {
        this.allProducts = [];
        this.filteredProducts = [];
        this.displayedProducts = [];
        this.cart = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.currentView = 'grid';
        this.priceRange = { min: 0, max: 1000 };
        this.searchQuery = '';
        this.sortBy = 'name';
        this.isLoading = false;
        this.maxPrice = 1000;
        this.loadCart(); // Cargar carrito al iniciar
    }

    updateProducts(products) {
        this.allProducts = products;

        // Calcular el precio máximo para ajustar el rango
        if (products.length > 0) {
            this.maxPrice = Math.max(...products.map(p => p.price));
            this.priceRange.max = this.maxPrice;
        }

        this.applyFilters();
    }

    applyFilters() {
        // Función auxiliar para quitar acentos
        function removeAccents(str) {
            return str.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();
        }
        let filtered = [...this.allProducts];

        // Filtro de búsqueda con soporte para acentos y mayúsculas/minúsculas
        if (this.searchQuery) {
            const query = removeAccents(this.searchQuery.trim());

            filtered = filtered.filter(product => {
                const titleNormalized = removeAccents(product.title);
                const descriptionNormalized = removeAccents(product.description);

                return titleNormalized.includes(query) ||
                    descriptionNormalized.includes(query);
            });
        }

        // Filtro de precio
        filtered = filtered.filter(product =>
            product.price >= this.priceRange.min && product.price <= this.priceRange.max
        );

        // Ordenamiento
        switch (this.sortBy) {
            case 'name':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
        }

        this.filteredProducts = filtered;
        this.totalPages = Math.ceil(filtered.length / CONFIG.PRODUCTS_PER_PAGE);
        this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
        this.updateDisplayedProducts();
    }

    updateDisplayedProducts() {
        const start = (this.currentPage - 1) * CONFIG.PRODUCTS_PER_PAGE;
        const end = start + CONFIG.PRODUCTS_PER_PAGE;
        this.displayedProducts = this.filteredProducts.slice(start, end);
    }

    addToCart(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.saveCart();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateCartQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        item.quantity += change;
        if (item.quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.saveCart();
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
            } catch (e) {
                console.error('Error cargando el carrito:', e);
                this.cart = [];
            }
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }
}
