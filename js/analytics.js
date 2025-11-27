// Analytics e eventos para TuCasse
// Reemplaza 'G-XXXXXXXXXX' con tu ID de Google Analytics 4

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX', {
  'page_path': window.location.pathname,
  'page_title': document.title,
  'language': 'es'
});

// Rastreo de eventos personalizados
const Analytics = {
    // Rastrear búsqueda
    trackSearch(searchQuery) {
        gtag('event', 'search', {
            'search_term': searchQuery
        });
    },
    
    // Rastrear vista de producto
    trackProductView(product) {
        gtag('event', 'view_item', {
            'items': [{
                'item_id': product.id,
                'item_name': product.title,
                'price': product.price,
                'currency': 'BOB'
            }]
        });
    },
    
    // Rastrear agregar al carrito
    trackAddToCart(product, quantity = 1) {
        gtag('event', 'add_to_cart', {
            'items': [{
                'item_id': product.id,
                'item_name': product.title,
                'price': product.price,
                'quantity': quantity,
                'currency': 'BOB'
            }]
        });
    },
    
    // Rastrear compra
    trackPurchase(cartItems, total) {
        gtag('event', 'purchase', {
            'transaction_id': 'T_' + Date.now(),
            'value': total,
            'currency': 'BOB',
            'items': cartItems.map(item => ({
                'item_id': item.id,
                'item_name': item.title,
                'price': item.price,
                'quantity': item.quantity
            }))
        });
    },
    
    // Rastrear vista de página
    trackPageView(pageName) {
        gtag('event', 'page_view', {
            'page_title': pageName,
            'page_location': window.location.href,
            'page_path': window.location.pathname
        });
    },
    
    // Rastrear clic en WhatsApp
    trackWhatsAppClick() {
        gtag('event', 'click', {
            'event_category': 'engagement',
            'event_label': 'whatsapp_contact'
        });
    },
    
    // Rastrear clic en redes sociales
    trackSocialClick(platform) {
        gtag('event', 'click', {
            'event_category': 'social',
            'event_label': platform
        });
    },
    
    // Rastrear tiempo en página
    trackTimeOnPage(seconds, pageName) {
        gtag('event', 'engagement', {
            'event_category': 'page_engagement',
            'event_label': pageName,
            'value': Math.round(seconds)
        });
    }
};

// Inicializar rastreo cuando se carga la app
document.addEventListener('DOMContentLoaded', () => {
    // Rastrear vista inicial de página
    Analytics.trackPageView(document.title);
});
