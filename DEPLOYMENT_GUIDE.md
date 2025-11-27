# 🚀 GUÍA DE DESPLIEGUE - TuCasse

## Hosting Recomendados

### 1. **Hosting Compartido (Mejor Precio/Calidad)**
- **Nombres:** Hostinger, SiteGround, Bluehost, HostGator
- **Precio:** $2-10/mes
- **Ventajas:** Fácil, barato, soporte 24/7
- **Desventajas:** Performance limitada
- **Ideal para:** Principiantes

### 2. **Cloud (Mejor Performance)**
- **Nombres:** AWS, Google Cloud, Azure, DigitalOcean, Linode
- **Precio:** $5-50+/mes
- **Ventajas:** Escalable, rápido, confiable
- **Desventajas:** Requiere conocimiento técnico
- **Ideal para:** Usuarios avanzados

### 3. **Vercel o Netlify (Gratis para estático)**
- **Precio:** Gratis para sitios estáticos
- **Ventajas:** CDN global, SSL gratis, muy rápido
- **Desventajas:** Limitado a contenido estático
- **Ideal para:** Deploy rápido

---

## 📋 CHECKLIST ANTES DE DESPLEGAR

### Configuración Técnica
- [ ] Verificar que todos los archivos estén presentes
- [ ] Probar localmente que funciona todo
- [ ] Validar HTML con W3C
- [ ] Ejecutar SEO Validator
- [ ] Probar en móvil, tablet y PC
- [ ] Probar en navegadores (Chrome, Firefox, Safari, Edge)
- [ ] Verificar que el .htaccess esté en la raíz
- [ ] Verificar permisos de archivos (644 para archivos, 755 para directorios)

### SEO y Analytics
- [ ] Tener lista tu ID de Google Analytics 4 (G-XXXXXXXXXX)
- [ ] Haber creado Search Console con verificación
- [ ] Tener listo tu dominio o subdomain
- [ ] Tener certificado SSL (HTTPS)

### Contenido
- [ ] Todos los productos cargados
- [ ] Imágenes optimizadas
- [ ] Descripciones correctas
- [ ] Precios actualizados
- [ ] Números de teléfono/contacto correctos

---

## 🌐 DESPLIEGUE EN HOSTINGER (Paso a Paso)

### Paso 1: Registrar Dominio
```
1. Ve a https://www.hostinger.com/
2. Busca tu dominio deseado (.com, .bo, etc.)
3. Si está disponible, cómpralo
4. Elige hosting "Premium" o superior (necesita .htaccess)
```

### Paso 2: Acceder al Panel
```
1. Login en Hostinger
2. Ve a Mi Cuenta > Hosting
3. Click en "Administrar"
4. Ve a Administrador de Archivos
```

### Paso 3: Subir Archivos
```
1. En Administrador de Archivos, ve a carpeta public_html
2. Sube todos los archivos del proyecto:
   - index.html
   - robots.txt
   - sitemap.xml
   - .htaccess
   - carpeta css/
   - carpeta js/
   - carpeta data/
   - carpeta Imagenes_Marca/
   - carpeta imagenes_descargadas/

3. Verifica que la estructura sea:
   public_html/
   ├── index.html
   ├── robots.txt
   ├── sitemap.xml
   ├── .htaccess
   └── [carpetas...]
```

### Paso 4: Configurar SSL
```
1. En panel Hostinger, busca "SSL"
2. Click en "Gestionar"
3. Elige "Let's Encrypt" (gratis)
4. Click en "Instalar"
5. Espera 5-10 minutos
```

### Paso 5: Redireccionamiento HTTPS
```
1. En .htaccess, descomenta estas líneas:
   # Forzar HTTPS
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

2. Guarda el archivo
```

### Paso 6: Configurar Dominio
```
1. En Hostinger, busca "Dominios"
2. Si es un dominio registrado con Hostinger:
   - Ya está configurado automáticamente
3. Si es un dominio externo:
   - Anota los DNS de Hostinger
   - Ve a tu proveedor de dominio (GoDaddy, etc.)
   - Actualiza DNS con los de Hostinger
   - Espera 24-48 horas para propagación
```

### Paso 7: Verificar que Funciona
```
1. Abre https://tucasse.com (o tu dominio)
2. Debe cargar perfectamente
3. Prueba búsqueda, carrito, WhatsApp
4. Verifica que no hay errores en consola
```

---

## 🔧 DESPLIEGUE CON VERCEL (Gratis y Muy Rápido)

### Paso 1: Preparar el Proyecto
```
# Crear archivo vercel.json en la raíz
{
  "buildCommand": "echo 'No build required'",
  "framework": "html",
  "regions": ["bue1"],
  "env": {}
}
```

### Paso 2: Conectar con GitHub
```
1. Sube tu proyecto a GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tuusuario/tucasse.git
   git push -u origin main

2. Ve a https://vercel.com
3. Click en "New Project"
4. Selecciona tu repositorio
5. Click en "Deploy"
```

### Paso 3: Configurar Dominio en Vercel
```
1. En el dashboard de Vercel, ve a Settings
2. Click en "Domains"
3. Agrega tu dominio
4. Vercel te dará instrucciones para DNS
5. Actualiza DNS en tu proveedor de dominio
```

---

## 🔍 CONFIGURAR SEARCH CONSOLE

Después de desplegar:

```
1. Ve a https://search.google.com/search-console/
2. Agrega tu propiedad:
   - Introduce tucasse.com
   - Click en "Continuar"
3. Verifica propiedad (elige uno):
   - HTML file (más fácil): Descarga, sube a raíz
   - DNS record: Necesita acceso a DNS
   - Google Analytics: Si ya tienes GA
4. Una vez verificado:
   - Ve a "Sitemaps"
   - Agrega https://tucasse.com/sitemap.xml
   - Click en "Enviar"
5. Ve a "URLs":
   - Click en "Solicitar indexación"
   - Ingresa https://tucasse.com
   - Envía
```

---

## 📊 CONFIGURAR GOOGLE ANALYTICS 4

```
1. Ve a https://analytics.google.com/
2. Click en "Crear propiedad"
3. Nombre: "TuCasse"
4. Zona horaria: "América/La_Paz"
5. Moneda: "BOB" (Bolivianos)
6. Copia tu ID (G-XXXXXXXXXX)
7. Reemplaza en:
   - js/analytics.js (línea 4)
   - index.html (script de GA4, línea donde está)
8. Click en "Crear stream web"
9. Ingresa URL: https://tucasse.com
10. Click "Crear stream"
11. Verifica que recibe datos (espera 5-10 minutos)
```

---

## ⚡ OPTIMIZACIONES POST-DESPLIEGUE

### 1. Minificar CSS y JS
```bash
# En terminal (necesita Node.js)
npm install -g cssnano terser

# Minificar CSS
cssnano css/style.css -o css/style.min.css

# Minificar JS
terser js/app.js -o js/app.min.js
```

### 2. Optimizar Imágenes
```bash
# Usar servicio online:
- TinyPNG.com (gratis hasta 500/mes)
- Cloudinary.com (gratis con límites)
- ImageOptim (Mac)
- FileOptimizer (Windows)
```

### 3. Monitorear Performance
```
Ejecutar regularmente:
- Google PageSpeed Insights
- Lighthouse (Chrome DevTools)
- WebPageTest.org
```

---

## 🐛 SOLUCIONAR PROBLEMAS COMUNES

### Problema: 404 Not Found
**Solución:**
- Verifica que index.html está en la raíz
- Comprueba permisos de archivos (644)
- Recarga caché del navegador (Ctrl+Shift+Delete)

### Problema: No carga CSS/JS
**Solución:**
- Verifica que las rutas son correctas en index.html
- Comprueba permisos de carpetas (755)
- En .htaccess, asegurate que permite acceso a css/ y js/

### Problema: 500 Internal Server Error
**Solución:**
- Revisa que .htaccess no tiene errores
- Si tiene errores, renómbralo a .htaccess.bak
- Si desaparece el error, hay problema en .htaccess

### Problema: No aparezco en Google
**Solución:**
- Google tarda 2-4 semanas
- Verifica Search Console
- Solicita indexación manualmente
- Asegurate que no tienes Disallow en robots.txt

### Problema: Analytics no funciona
**Solución:**
- Verifica que GA ID es correcto (G-XXXXXXXXXX)
- Abre consola (F12) y busca "gtag"
- Espera 24-48 horas para ver datos
- Prueba en navegador incógnito (sin bloqueadores)

---

## 📋 CHECKLIST POST-DESPLIEGUE

- [ ] Dominio apunta correctamente
- [ ] SSL/HTTPS funcionando
- [ ] Página carga en < 3 segundos
- [ ] Todas las imágenes se ven correctamente
- [ ] Buscador funciona
- [ ] Carrito funciona
- [ ] Botón WhatsApp redirige correctamente
- [ ] Analytics recibe datos
- [ ] Search Console registra rastreos
- [ ] Lighthouse score > 80
- [ ] Sin errores en consola del navegador

---

## 📞 RECURSOS DE SOPORTE

### Para Hostinger
- **Chat en vivo:** 24/7 en panel
- **Email:** support@hostinger.com
- **Teléfono:** +34 900 122 000 (España)

### Para Vercel
- **Documentación:** https://vercel.com/docs
- **GitHub Issues:** Reporta bugs

### Google
- **Search Central:** https://developers.google.com/search
- **Analytics Help:** https://support.google.com/analytics/
- **Support Community:** https://support.google.com/

---

## ✨ SIGUIENTES PASOS

1. **Semana 1:** Monitorea que indexe correctamente
2. **Semana 2:** Analiza tráfico en Analytics
3. **Semana 3:** Optimiza según datos (si es necesario)
4. **Mes 1:** Revisa posiciones en Google
5. **Mes 2:** Implementa mejoras encontradas

---

**¡Tu tienda está lista para el mundo! 🌍**

Última actualización: 26 de noviembre de 2025
