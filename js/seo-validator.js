// Validador de SEO para TuCasse
// Ejecutar en consola del navegador: new SEOValidator().runAudit()

class SEOValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.success = [];
    }

    // Ejecutar auditoría completa
    runAudit() {
        console.clear();
        console.log('🔍 AUDITORÍA SEO - TuCasse');
        console.log('═══════════════════════════════════════════\n');
        
        this.checkMetaTags();
        this.checkHeadings();
        this.checkImages();
        this.checkLinks();
        this.checkSchema();
        this.checkMobileOptimization();
        this.checkPerformance();
        
        this.printResults();
    }

    checkMetaTags() {
        console.log('📝 Verificando Meta Tags...\n');
        
        const title = document.querySelector('title');
        if (title && title.textContent.length > 0) {
            if (title.textContent.length >= 30 && title.textContent.length <= 60) {
                this.success.push('✅ Title tag optimizado: ' + title.textContent);
            } else {
                this.warnings.push('⚠️ Title tag debería tener 30-60 caracteres (actual: ' + title.textContent.length + ')');
            }
        } else {
            this.errors.push('❌ Falta el title tag');
        }

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            const desc = metaDescription.content;
            if (desc.length >= 120 && desc.length <= 160) {
                this.success.push('✅ Meta description optimizada: ' + desc);
            } else {
                this.warnings.push('⚠️ Meta description debería tener 120-160 caracteres (actual: ' + desc.length + ')');
            }
        } else {
            this.errors.push('❌ Falta la meta description');
        }

        const metaViewport = document.querySelector('meta[name="viewport"]');
        if (metaViewport) {
            this.success.push('✅ Meta viewport presente (responsive)');
        } else {
            this.errors.push('❌ Falta meta viewport');
        }

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            this.success.push('✅ URL canónica configurada');
        } else {
            this.warnings.push('⚠️ Se recomienda agregar URL canónica');
        }

        const ogTags = document.querySelectorAll('meta[property^="og:"]');
        if (ogTags.length >= 4) {
            this.success.push('✅ Open Graph tags configurados (' + ogTags.length + ')');
        } else {
            this.warnings.push('⚠️ Open Graph incompleto (' + ogTags.length + ' tags)');
        }

        const robots = document.querySelector('meta[name="robots"]');
        if (robots && robots.content.includes('index')) {
            this.success.push('✅ Meta robots: index, follow');
        } else {
            this.warnings.push('⚠️ Meta robots no está configurado correctamente');
        }
    }

    checkHeadings() {
        console.log('\n🏷️ Verificando Headings...\n');
        
        const h1s = document.querySelectorAll('h1');
        if (h1s.length === 1) {
            this.success.push('✅ Un solo H1: ' + h1s[0].textContent.trim());
        } else if (h1s.length === 0) {
            this.errors.push('❌ Falta H1 tag');
        } else {
            this.warnings.push('⚠️ Múltiples H1 tags (' + h1s.length + '). Se recomienda solo 1');
        }

        const h2s = document.querySelectorAll('h2');
        if (h2s.length > 0) {
            this.success.push('✅ ' + h2s.length + ' H2 tags encontrados');
        }
    }

    checkImages() {
        console.log('\n🖼️ Verificando Imágenes...\n');
        
        const images = document.querySelectorAll('img');
        let imagesWithAlt = 0;
        
        images.forEach(img => {
            if (img.alt && img.alt.length > 0) {
                imagesWithAlt++;
            } else {
                this.warnings.push('⚠️ Imagen sin alt text: ' + img.src.substring(0, 50));
            }
        });

        if (imagesWithAlt === images.length) {
            this.success.push('✅ Todas las imágenes tienen alt text (' + images.length + ')');
        } else {
            this.warnings.push('⚠️ ' + (images.length - imagesWithAlt) + ' imágenes sin alt text');
        }
    }

    checkLinks() {
        console.log('\n🔗 Verificando Links...\n');
        
        const links = document.querySelectorAll('a');
        let linksWithTitle = 0;
        
        links.forEach(link => {
            if (link.title || link.textContent.length > 0) {
                linksWithTitle++;
            }
        });

        this.success.push('✅ ' + links.length + ' links encontrados');
        if (linksWithTitle >= links.length * 0.8) {
            this.success.push('✅ Links tienen texto descriptivo');
        } else {
            this.warnings.push('⚠️ Algunos links no tienen texto descriptivo');
        }
    }

    checkSchema() {
        console.log('\n📊 Verificando Schema.org...\n');
        
        const schemas = document.querySelectorAll('script[type="application/ld+json"]');
        if (schemas.length > 0) {
            this.success.push('✅ ' + schemas.length + ' Schema.org markup(s) encontrado(s)');
            
            schemas.forEach((schema, i) => {
                try {
                    const data = JSON.parse(schema.textContent);
                    console.log('   - Schema ' + (i + 1) + ': @type = ' + data['@type']);
                } catch (e) {
                    this.warnings.push('⚠️ Schema ' + (i + 1) + ' tiene JSON inválido');
                }
            });
        } else {
            this.errors.push('❌ No hay Schema.org markup');
        }
    }

    checkMobileOptimization() {
        console.log('\n📱 Verificando Optimización Móvil...\n');
        
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            this.success.push('✅ Viewport meta tag presente');
        }

        // Revisar si hay media queries en CSS
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        this.warnings.push('ℹ️ ' + cssLinks.length + ' archivos CSS detectados. Asegúrate que sean responsive');
    }

    checkPerformance() {
        console.log('\n⚡ Verificando Performance...\n');
        
        // Tamaño de recursos
        const scripts = document.querySelectorAll('script');
        const styles = document.querySelectorAll('link[rel="stylesheet"]');
        
        this.success.push('✅ ' + scripts.length + ' scripts cargados');
        this.success.push('✅ ' + styles.length + ' stylesheets cargados');

        // Lazy loading
        const lazyImages = document.querySelectorAll('img[data-src]');
        if (lazyImages.length > 0) {
            this.success.push('✅ Lazy loading implementado (' + lazyImages.length + ' imágenes)');
        }
    }

    printResults() {
        console.log('\n═══════════════════════════════════════════');
        console.log('📊 RESULTADOS DE LA AUDITORÍA\n');

        if (this.success.length > 0) {
            console.group('✅ CORRECTO (' + this.success.length + ')');
            this.success.forEach(msg => console.log(msg));
            console.groupEnd();
        }

        if (this.warnings.length > 0) {
            console.group('⚠️ ADVERTENCIAS (' + this.warnings.length + ')');
            this.warnings.forEach(msg => console.log(msg));
            console.groupEnd();
        }

        if (this.errors.length > 0) {
            console.group('❌ ERRORES (' + this.errors.length + ')');
            this.errors.forEach(msg => console.log(msg));
            console.groupEnd();
        }

        // Puntuación
        const total = this.success.length + this.warnings.length + this.errors.length;
        const score = Math.round((this.success.length / total) * 100);
        
        console.log('\n═══════════════════════════════════════════');
        console.log('📈 PUNTUACIÓN SEO: ' + score + '/100\n');

        if (score >= 80) {
            console.log('🎉 ¡Excelente! Tu SEO está muy bien optimizado.');
        } else if (score >= 60) {
            console.log('👍 Bueno. Pero hay mejoras que hacer.');
        } else {
            console.log('⚠️ Hay varios problemas que arreglar.');
        }

        console.log('═══════════════════════════════════════════\n');
    }
}

// Crear instancia y ejecutar auditoría
// Si se carga automáticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // No se ejecuta automáticamente, solo cuando lo llames
    });
}
