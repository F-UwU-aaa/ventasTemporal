// Sistema de lazy loading optimizado
class LazyImageLoader {
    constructor() {
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            { rootMargin: `${CONFIG.IMAGE_LAZY_OFFSET}px` }
        );
        this.loadedImages = new Set();
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
            }
        });
    }

    loadImage(img) {
        if (this.loadedImages.has(img.dataset.src)) return;
        this.loadedImages.add(img.dataset.src);

        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = tempImg.src;
            img.removeAttribute('data-loading');
            img.style.opacity = '1';
            this.observer.unobserve(img);
        };
        tempImg.onerror = () => {
            img.parentElement.innerHTML = '<div style="color: #999; font-size: 0.9rem;">Imagen no disponible</div>';
            this.observer.unobserve(img);
        };
        tempImg.src = img.dataset.src;
    }

    observe(img) {
        this.observer.observe(img);
    }
}
