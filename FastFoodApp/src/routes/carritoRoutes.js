// src/routes/carritoRoutes.js
const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /productos y /carrito → Mostrar catálogo + carrito
router.get('/', async (req, res, next) => {
  try {
    const productos = await prisma.producto.findMany({ orderBy: { nombre: 'asc' } });
    const carrito   = req.session.carrito || [];
    // Pasa además el título opcional:
    res.render('cliente/tienda', { productos, carrito, title: 'Menú y Carrito FastFood' });
  } catch (error) {
    next(error);
  }
});

// POST /carrito/agregar
router.post('/agregar', async (req, res, next) => {
  try {
    const { productoId, cantidad } = req.body;
    const qty = parseInt(cantidad, 10);
    const producto = await prisma.producto.findUnique({ where: { id: Number(productoId) } });
    if (!producto) return res.redirect('/productos');

    req.session.carrito = req.session.carrito || [];
    const exists = req.session.carrito.find(item => item.productoId === producto.id);
    if (exists) {
      exists.cantidad += qty;
      exists.subtotal = exists.cantidad * producto.precio;
    } else {
      req.session.carrito.push({
        productoId: producto.id,
        nombre:      producto.nombre,
        precio:      producto.precio,
        cantidad:    qty,
        subtotal:    qty * producto.precio
      });
    }
    // Volvemos a la misma página de catálogo + carrito
    res.redirect('/productos');
  } catch (error) {
    next(error);
  }
});

// POST /carrito/eliminar
router.post('/eliminar', (req, res) => {
  const prodId = Number(req.body.productoId);
  req.session.carrito = (req.session.carrito || []).filter(item => item.productoId !== prodId);
  res.redirect('/productos');
});

// POST /carrito/actualizar
router.post('/actualizar', (req, res) => {
  const prodId = Number(req.body.productoId);
  const qty    = parseInt(req.body.cantidad, 10);
  const carrito = req.session.carrito || [];
  const item = carrito.find(i => i.productoId === prodId);
  if (item) {
    if (qty <= 0) {
      req.session.carrito = carrito.filter(i => i.productoId !== prodId);
    } else {
      item.cantidad = qty;
      item.subtotal = qty * item.precio;
      req.session.carrito = carrito;
    }
  }
  res.redirect('/productos');
});

module.exports = router;
