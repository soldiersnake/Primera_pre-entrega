// src/routes/products.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const productsFilePath = path.join(__dirname, '../data/products.json');

// Función para verificar y crear el archivo si no existe
function ensureProductsFileExists() {
  if (!fs.existsSync(productsFilePath)) {
    fs.writeFileSync(productsFilePath, JSON.stringify([]));
  }
}

// Leer productos de archivo JSON
function getProducts() {
  ensureProductsFileExists(); // Asegúrate de que el archivo exista antes de leer
  const data = fs.readFileSync(productsFilePath, 'utf8');
  return JSON.parse(data);
}

// Guardar productos en archivo JSON
function saveProducts(products) {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
}

// Ruta para obtener todos los productos
router.get('/', (req, res) => {
  const { limit } = req.query;
  let products = getProducts();

  if (limit) {
    products = products.slice(0, parseInt(limit));
  }

  res.status(200).json(products);
});

// Ruta para obtener un producto por ID
router.get('/:pid', (req, res) => {
  const { pid } = req.params;
  const products = getProducts();
  const product = products.find(p => p.id === pid);

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.status(200).json(product);
});

// Ruta para agregar un nuevo producto
router.post('/', (req, res) => {
  // Verifica y crea el archivo si no existe
  ensureProductsFileExists();

  const { title, description, code, price, stock, category, thumbnails } = req.body;
  const products = getProducts();

  // Crear un nuevo producto con un ID único
  const newProduct = {
    id: Date.now().toString(), // Genera un ID único basado en la marca de tiempo actual
    title,
    description,
    code,
    price,
    status: true, // El estado por defecto es verdadero
    stock,
    category,
    thumbnails: thumbnails || [] // Usa un arreglo vacío si no se proporcionan imágenes
  };

  // Agregar el nuevo producto a la lista y guardar
  products.push(newProduct);
  saveProducts(products);

  // Responder con el nuevo producto creado
  res.status(201).json(newProduct);
});

// Ruta para actualizar un producto por ID
router.put('/:pid', (req, res) => {
  const { pid } = req.params;
  const { title, description, code, price, stock, category, thumbnails } = req.body;
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === pid);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // Actualizar el producto con los datos proporcionados
  const updatedProduct = {
    ...products[productIndex],
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails
  };

  products[productIndex] = updatedProduct;
  saveProducts(products);

  // Responder con el producto actualizado
  res.status(200).json(updatedProduct);
});

// Ruta para eliminar un producto por ID
router.delete('/:pid', (req, res) => {
  const { pid } = req.params;
  let products = getProducts();
  const productIndex = products.findIndex(p => p.id === pid);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // Eliminar el producto de la lista
  products.splice(productIndex, 1);
  saveProducts(products);

  // Responder con estado 204 (sin contenido)
  res.status(204).send();
});

module.exports = router;
