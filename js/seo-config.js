// Configuración SEO para TuCasse
const SEO_CONFIG = {
    // Información básica de la tienda
    storeName: 'TuCasse',
    storeDescription: 'Tienda online de productos de calidad en Bolivia. Descubre miles de artículos a precios increíbles con envíos seguros y atención personalizada.',
    storeUrl: 'https://tucasse.com',
    storeImage: 'Imagenes_Marca/marca_transparente.png',
    
    // Contacto
    phone: '+59176748058',
    email: 'contacto@tucasse.com',
    country: 'Bolivia',
    
    // Palabras clave principales
    mainKeywords: [
        'tienda online Bolivia',
        'comprar online',
        'productos de calidad',
        'decoración',
        'electrónica',
        'hogar',
        'ropa y accesorios',
        'ofertas online',
        'envíos a Bolivia',
        'tienda de confianza'
    ],
    
    // Redes sociales
    socialMedia: {
        whatsapp: 'https://wa.me/59176748058',
        tiktok: 'https://www.tiktok.com/@tucasse',
        instagram: 'https://instagram.com/tucasse',
        facebook: 'https://facebook.com/tucasse'
    },
    
    // Schema.org markup para productos
    generateProductSchema(product) {
        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.title,
            "description": product.description,
            "image": product.mainImage,
            "offers": {
                "@type": "Offer",
                "priceCurrency": "BOB",
                "price": product.price.toString(),
                "availability": "https://schema.org/InStock"
            },
            "brand": {
                "@type": "Brand",
                "name": "TuCasse"
            }
        };
    },
    
    // Breadcrumb schema
    generateBreadcrumbSchema(items) {
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": item.url
            }))
        };
    },
    
    // FAQ schema para preguntas frecuentes
    generateFAQSchema(faqs) {
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };
    },
    
    // Localización Business schema
    generateLocalBusinessSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": this.storeName,
            "description": this.storeDescription,
            "url": this.storeUrl,
            "logo": this.storeImage,
            "image": this.storeImage,
            "telephone": this.phone,
            "email": this.email,
            "address": {
                "@type": "PostalAddress",
                "addressCountry": this.country,
                "addressLocality": "Bolivia"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "telephone": this.phone,
                "contactOption": "TollFree"
            },
            "areaServed": this.country
        };
    },
    
    // Funciones de utilidad para meta tags dinámicos
    generateMetaTags(page) {
        const tags = {
            home: {
                title: 'TuCasse - Tienda Online de Productos de Calidad en Bolivia',
                description: this.storeDescription,
                keywords: this.mainKeywords.join(', ')
            },
            products: {
                title: 'Productos - TuCasse | Tienda Online Bolivia',
                description: 'Explora nuestro catálogo completo de productos de calidad. Encuentra lo que buscas a los mejores precios.',
                keywords: ['productos', 'catálogo', 'tienda online'].concat(this.mainKeywords).join(', ')
            },
            cart: {
                title: 'Carrito de Compras - TuCasse',
                description: 'Revisa tu carrito de compras y procede a pagar. Envíos seguros en toda Bolivia.',
                keywords: ['carrito', 'compras', 'pago'].concat(this.mainKeywords).join(', ')
            }
        };
        
        return tags[page] || tags.home;
    },
    
    // Inyectar schema.org en el head
    injectSchema(schemaData) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schemaData);
        document.head.appendChild(script);
    }
};

// Inyectar schema local business al cargar
document.addEventListener('DOMContentLoaded', () => {
    SEO_CONFIG.injectSchema(SEO_CONFIG.generateLocalBusinessSchema());
});
