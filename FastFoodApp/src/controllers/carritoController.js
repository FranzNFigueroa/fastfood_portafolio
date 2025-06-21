// src/controllers/carritoController.js

const prisma = require('../config/prisma');

exports.verCarrito = (req, res) => {
  const carrito = req.session.carrito || [];
  return res.render('cliente/carrito', { carrito, usuario: req.session.usuario });
};

exports.agregarAlCarrito = async (req, res) => {
  const { productoId } = req.body;
  const prodId = parseInt(productoId, 10);

  // Si no hay carrito en sesión, inicializamos el array
  if (!req.session.carrito) {
    req.session.carrito = [];
  }
  const carrito = req.session.carrito;

  try {
    // Buscar datos básicos del producto (nombre, precio, imagen)
    const producto = await prisma.producto.findUnique({
      where: { id: prodId },
      select: {
        id: true,
        nombre: true,
        precio: true,
        imagen: true
      }
    });
    if (!producto) {
      return res.redirect('/productos');
    }

    // Verificar si ya está en el carrito
    const idx = carrito.findIndex(item => item.productoId === prodId);
    if (idx > -1) {
      // Si existe, incrementamos la cantidad
      carrito[idx].cantidad += 1;
      carrito[idx].subtotal = carrito[idx].cantidad * carrito[idx].precio;
    } else {
      // Si no existe, lo agregamos con cantidad = 1
      carrito.push({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        cantidad: 1,
        subtotal: producto.precio
      });
    }

    // Guardamos el carrito en sesión
    req.session.carrito = carrito;
    // ← Cambiamos la redirección para ir directamente a /carrito
    return res.redirect('/carrito');
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    return res.redirect('/productos');
  }
};

exports.eliminarDeCarrito = (req, res) => {
  const { productoId } = req.body;
  const prodId = parseInt(productoId, 10);

  const carrito = req.session.carrito || [];
  // Filtramos los items que no coincidan con este producto
  req.session.carrito = carrito.filter(item => item.productoId !== prodId);
  return res.redirect('/carrito');
};

exports.actualizarCantidad = (req, res) => {
  const { productoId, cantidad } = req.body;
  const prodId = parseInt(productoId, 10);
  const nuevaCantidad = parseInt(cantidad, 10);

  const carrito = req.session.carrito || [];
  const idx = carrito.findIndex(item => item.productoId === prodId);
  if (idx > -1) {
    if (nuevaCantidad <= 0) {
      // Si la cantidad es 0 o negativa, lo quitamos
      req.session.carrito = carrito.filter(item => item.productoId !== prodId);
    } else {
      carrito[idx].cantidad = nuevaCantidad;
      carrito[idx].subtotal = nuevaCantidad * carrito[idx].precio;
      req.session.carrito = carrito;
    }
  }
  return res.redirect('/carrito');
};
