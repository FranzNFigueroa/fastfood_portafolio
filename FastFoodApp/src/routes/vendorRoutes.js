// src/routes/vendorRoutes.js
const express = require('express');
const router  = express.Router();
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(
  ensureAuthenticated,
  ensureRole('VENDEDOR'),
  (req, res, next) => {
    if (!req.session.saleCart) req.session.saleCart = [];
    // Le decimos a ejs-layouts que use el layout de vendedor
    res.locals.layout = 'layouts/vendedor';
    next();
  }
);

// GET /vendedor y /vendedor/venta → productos + caja
router.get(['/', '/venta'], async (req, res, next) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { OR: [{ stock: { gt: 0 } }, { stock: null }] },
      orderBy: { nombre: 'asc' }
    });
    const cart  = req.session.saleCart;
    const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

    // Opcional: al cerrar venta, marcamos flag para alerta y limpiamos carrito
    const ventaSuccess = req.session.ventaSuccess || false;
    if (ventaSuccess) delete req.session.ventaSuccess;

    res.render('vendedor/tienda', { productos, cart, total, ventaSuccess, title: 'Caja Vendedor' });
  } catch (err) {
    next(err);
  }
});

// POST /vendedor/venta/add → agregar ítem
router.post('/venta/add', async (req, res, next) => {
  try {
    const { productId, cantidad } = req.body;
    const qty = parseInt(cantidad, 10);
    const producto = await prisma.producto.findUnique({ where: { id: Number(productId) } });
    if (!producto) return res.redirect('/vendedor');

    req.session.saleCart = req.session.saleCart || [];
    const exists = req.session.saleCart.find(i => i.id === producto.id);
    if (exists) {
      exists.cantidad += qty;
    } else {
      req.session.saleCart.push({
        id:       producto.id,
        nombre:   producto.nombre,
        precio:   producto.precio,
        cantidad: qty
      });
    }
    res.redirect('/vendedor');
  } catch (err) {
    next(err);
  }
});

// POST /vendedor/venta/remove → eliminar ítem
router.post('/venta/remove', (req, res) => {
  const prodId = Number(req.body.productId);
  req.session.saleCart = (req.session.saleCart || [])
    .filter(item => item.id !== prodId);
  res.redirect('/vendedor');
});

// POST /vendedor/venta/checkout → finalizar venta (efectivo)
router.post('/venta/checkout', async (req, res, next) => {
  try {
    const cart  = req.session.saleCart || [];
    const total = cart.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

    // Guardar pedido
    await prisma.pedido.create({
      data: {
        clienteId:    req.session.usuario.id,
        direccion:    req.session.usuario.direccion,
        telefono:     req.session.usuario.telefono,
        tipoEntrega:  'RETIRO',
        total,
        detalles: {
          create: cart.map(i => ({
            productoId: i.id,
            cantidad:   i.cantidad,
            subtotal:   i.precio * i.cantidad
          }))
        }
      }
    });

    // Reset carrito y flag de éxito
    req.session.saleCart    = [];
    req.session.ventaSuccess = true;
    res.redirect('/vendedor');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
