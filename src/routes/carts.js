// src/routes/carts.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const cartsFilePath = path.join(__dirname, '../data/carts.json');

// Función para verificar y crear el archivo si no existe
function ensureCartsFileExists() {
  if (!fs.existsSync(cartsFilePath)) {
    fs.writeFileSync(cartsFilePath, JSON.stringify([]));
  }
}

// Leer carritos de archivo JSON
function getCarts() {
  ensureCartsFileExists(); // Asegúrate de que el archivo exista antes de leer
  const data = fs.readFileSync(cartsFilePath, 'utf8');
  return JSON.parse(data);
}

// Guardar carritos en archivo JSON
function saveCarts(carts) {
  fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
}

// Ruta para crear un nuevo carrito
router.post('/', (req, res) => {
  // Verifica y crea el archivo si no existe
  ensureCartsFileExists();

  const carts = getCarts();

  const newCart = {
    id: Date.now().toString(), // Genera un ID único
    products: [] // Inicialmente, el carrito está vacío
  };

  carts.push(newCart);
  saveCarts(carts);

  res.status(201).json(newCart);
});

// Ruta para obtener productos de un carrito por ID
router.get('/:cid', (req, res) => {
  const { cid } = req.params;
  const carts = getCarts();
  const cart = carts.find(c => c.id === cid);

  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  res.json(cart.products);
});

// Ruta para agregar un producto a un carrito
router.post('/:cid/product/:pid', (req, res) => {
  const { cid, pid } = req.params;
  const carts = getCarts();
  const cart = carts.find(c => c.id === cid);

  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  // Verifica si el producto ya está en el carrito
  const productIndex = cart.products.findIndex(p => p.product === pid);

  if (productIndex === -1) {
    // Si no está, agregarlo con cantidad 1
    cart.products.push({ product: pid, quantity: 1 });
  } else {
    // Si ya está, incrementar la cantidad
    cart.products[productIndex].quantity += 1;
  }

  saveCarts(carts);

  res.status(200).json(cart);
});

// Ruta para eliminar un carrito por ID
router.delete('/:cid', (req, res) => {
    const { cid } = req.params;
    let carts = getCarts();
  
    // Buscar el índice del carrito a eliminar
    const cartIndex = carts.findIndex(c => c.id === cid);
  
    if (cartIndex === -1) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
  
    // Eliminar el carrito del arreglo
    carts.splice(cartIndex, 1);
    saveCarts(carts);
  
    // Responder con un mensaje de éxito y el carrito eliminado
    res.status(200).json({
        message: 'Carrito eliminado exitosamente',
        cart: removedCart
    });
  });

module.exports = router;
