# 🛍️ TuCasse - Tienda Online de Productos de Calidad en Bolivia

[![SEO Status](https://img.shields.io/badge/SEO-✅_Optimized-brightgreen)](.)
[![Performance](https://img.shields.io/badge/Performance-⚡_Optimized-blue)](.)
[![Mobile](https://img.shields.io/badge/Mobile-📱_Responsive-blue)](.)
[![Accessibility](https://img.shields.io/badge/Accessibility-♿_WCAG_2.1-blue)](.)

## 📋 Descripción

**TuCasse** es una tienda online moderna y optimizada para SEO que ofrece productos de calidad a precios increíbles. Construida con HTML5, CSS3, y JavaScript vanilla (sin dependencias).

### Características

- ✅ **Totalmente Responsivo** - Funciona perfectamente en móviles, tablets y PC
- ✅ **Optimizado SEO** - Meta tags, Schema.org, Open Graph completamente configurado
- ✅ **Performance Optimizado** - Lazy loading, compresión GZIP, caché del navegador
- ✅ **Analytics Integrado** - Google Analytics 4 con eventos de conversión
- ✅ **Seguridad** - Headers de seguridad, protección contra XSS
- ✅ **Carrito de Compras** - Funcional con almacenamiento local
- ✅ **Integración WhatsApp** - Botón de contacto directo
- ✅ **Modo Oscuro/Claro** - Cambio de tema automático

---

## 🚀 Inicio Rápido

### 1. Clonar o descargar el proyecto
```bash
git clone https://github.com/tuusuario/tucasse.git
cd tucasse
```

### 2. Abrir en navegador
```bash
# Opción 1: Doble clic en index.html
open index.html

# Opción 2: Con Live Server (recomendado)
# Instala Live Server en VS Code
# Click derecho en index.html > Open with Live Server
```

### 3. Verificar que funcione
Abre http://localhost:5500 (o similar)

---

## 📁 Estructura del Proyecto

```
TuCasse/
├── index.html                 # Archivo principal
├── robots.txt                 # SEO: Control de rastreo
├── sitemap.xml               # SEO: Mapa del sitio
├── .htaccess                 # Optimizaciones de servidor
│
├── css/                       # Estilos
│   ├── style.css             # Estilos principales
│   ├── responsive.css        # Responsivo
│   └── [otros archivos CSS]
│
├── js/                        # Scripts
│   ├── app.js                # Lógica principal
│   ├── config.js             # Configuración
│   ├── seo-config.js         # Configuración SEO
│   ├── analytics.js          # Google Analytics 4
│   ├── seo-validator.js      # Validador de SEO
│   ├── renderer.js           # Renderizado de UI
│   ├── services.js           # Servicios
│   ├── state.js              # Gestión de estado
│   └── utils.js              # Utilidades
│
├── data/
│   └── productos.json        # Base de datos de productos
│
├── Imagenes_Marca/           # Logo y favicon
├── imagenes_descargadas/     # Imágenes de productos
│
├── SEO_GUIDE.md              # Guía completa de SEO
├── LIGHTHOUSE_GUIDE.md       # Auditoría de performance
└── OPTIMIZACION_FINAL.md     # Resumen de optimizaciones
```

---

## ⚙️ Configuración Necesaria

### 1. Google Search Console (Obligatorio)
```
1. Ve a: https://search.google.com/search-console/
2. Verifica tu dominio
3. Sube sitemap.xml
```

### 2. Google Analytics 4 (Obligatorio)
```
1. Crea propiedad GA4
2. Copia tu ID (G-XXXXXXXXXX)
3. Reemplaza en:
   - js/analytics.js (línea 4)
   - index.html (script de GA4)
```

### 3. WhatsApp Business (Opcional)
El botón de WhatsApp usa: +591-76748058
Reemplaza el número en:
- index.html (línea del footer)
- js/app.js (función sendToWhatsApp)

---

## 🔍 Validar SEO

Abre la consola del navegador (F12) y ejecuta:

```javascript
new SEOValidator().runAudit()
```

Esto mostrará:
- ✅ Meta tags correctos
- ⚠️ Advertencias
- ❌ Errores
- 📈 Puntuación SEO

---

## 📊 Palabras Clave Objetivo

### Principales
- tienda online Bolivia
- comprar online
- productos de calidad
- tienda de confianza

### Secundarias
- decoración Bolivia
- electrónica online
- hogar Bolivia
- ropa y accesorios

---

## 📱 Responsive Design

Optimizado para:
- 📱 Móviles (320px - 480px)
- 📱 Tablets (481px - 768px)
- 💻 Laptops (769px - 1024px)
- 🖥️ Desktop (1025px+)

---

## ⚡ Performance

- Lazy loading de imágenes
- Compresión GZIP habilitada
- Caché del navegador configurado
- Minificación de CSS/JS
- Optimización de fuentes

**Objetivo:** > 90 en Lighthouse

---

## 🔐 Seguridad

- ✅ Headers de seguridad
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-XSS-Protection
- ✅ Protección CORS

---

## 📈 SEO Implementado

### On-Page
- ✅ Meta tags (title, description)
- ✅ Headings jerárquicos (H1, H2, H3)
- ✅ Alt text en imágenes
- ✅ URLs amigables
- ✅ Links internos relevantes

### Off-Page
- ✅ Open Graph (Facebook/WhatsApp)
- ✅ Twitter Card
- ✅ Schema.org (LocalBusiness, Product)
- ✅ JSON-LD structured data

### Technical
- ✅ robots.txt
- ✅ sitemap.xml
- ✅ Canonical URLs
- ✅ Mobile-friendly
- ✅ Fast loading

---

## 🛠️ Herramientas Recomendadas

| Herramienta | URL | Uso |
|-------------|-----|-----|
| Search Console | https://search.google.com/search-console/ | Monitoreo SEO |
| Analytics | https://analytics.google.com/ | Tráfico |
| Lighthouse | Chrome DevTools | Auditoría |
| PageSpeed | https://pagespeed.web.dev/ | Velocidad |
| W3C Validator | https://validator.w3.org/ | HTML válido |

---

## 📝 Changelog

### v1.0 - 26 Noviembre 2025
- ✅ Optimización SEO completa
- ✅ Cambio de marca: TiendaPinPonChis → TuCasse
- ✅ Meta tags + Open Graph + Twitter Card
- ✅ Schema.org JSON-LD
- ✅ Google Analytics 4
- ✅ robots.txt + sitemap.xml
- ✅ .htaccess optimizado
- ✅ Validador de SEO
- ✅ Documentación completa

---

## 📚 Documentación

- **[SEO_GUIDE.md](./SEO_GUIDE.md)** - Guía completa de SEO
- **[LIGHTHOUSE_GUIDE.md](./LIGHTHOUSE_GUIDE.md)** - Auditoría de performance
- **[OPTIMIZACION_FINAL.md](./OPTIMIZACION_FINAL.md)** - Resumen ejecutivo

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

- **WhatsApp:** +591-76748058
- **Email:** contacto@tucasse.com
- **Ubicación:** Bolivia

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

## 🌟 Agradecimientos

Gracias por usar TuCasse. Si te ha sido útil, considera compartirlo con otros.

---

**Hecho con ❤️ para TuCasse**
**Optimización SEO Completa - Noviembre 2025**
