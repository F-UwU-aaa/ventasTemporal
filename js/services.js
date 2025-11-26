// Cargador de JSON
class JSONLoader {
    async loadProducts() {
        try {
            const response = await fetch(CONFIG.JSON_FILE);
            if (!response.ok) {
                throw new Error(`Error al cargar el archivo JSON: ${response.statusText}`);
            }
            const data = await response.json();
            return this.processProducts(data);
        } catch (error) {
            console.error('Error cargando productos desde JSON:', error);
            throw error;
        }
    }

    processProducts(data) {
        return data.map((row, index) => {
            // Procesar imágenes - manejar una o múltiples imágenes separadas por ;
            let images = [];
            if (row.NombreImg) {
                const imageNames = row.NombreImg.split(';').map(name => name.trim());
                images = imageNames.map(name => `${CONFIG.IMAGES_FOLDER}${name}`);
            }
            return {
                id: row.id || index + 1,
                title: row.Titulo || 'Producto sin título',
                description: row.Descripcion || 'Sin descripción',
                price: parseFloat(row.Precio) || 0,
                images: images,
                mainImage: images[0] || `${CONFIG.IMAGES_FOLDER}placeholder.jpg`
            };
        });
    }
}
