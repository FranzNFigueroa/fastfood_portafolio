// src/routes/vendorTransbank.js
const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Credenciales y headers de Transbank
const headers = {
  "Authorization":      "Token",
  "Tbk-Api-Key-Id":     "597055555532",
  "Tbk-Api-Key-Secret": "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
  "Content-Type":       "application/json",
  "Access-Control-Allow-Origin": "*",
  "Referrer-Policy":    "origin-when-cross-origin"
};

// 1) Iniciar pago con tarjeta (vendedor)
router.post('/vendedor/sendpay', async (req, res) => {
  try {
    const monto      = Number(req.body.monto);
    const buy_order  = `VTA-${Date.now()}`;
    const session_id = req.sessionID;

    // Guardar carrito de vendedor en sesión
    req.session.cartVendedor = req.session.cartVendedor || req.session.cart || [];
    req.session.currentVendorOrder = {
      buy_order,
      items: req.session.cartVendedor
    };

    const data = {
      amount:     monto,
      buy_order,
      session_id,
      return_url: "http://localhost:3000/vendedor/commitpay"
    };

    const response = await axios.post(
      "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions",
      data,
      { headers }
    );

    return res.render('sendpay', {
      transbank: {
        url:   response.data.url,
        token: response.data.token
      },
      amount: monto
    });
  } catch (err) {
    console.error('Error iniciar pago vendedor:', err.response?.data || err.message);
    return res.status(500).send('Error al iniciar pago con Transbank');
  }
});

// 2) Commit y grabar venta (vendedor)
router.get('/vendedor/commitpay', async (req, res) => {
  try {
    const tokenws = req.query.token_ws;
    if (!tokenws) return res.render('commitpay', { transaction_detail: null });

    const url      = `https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${tokenws}`;
    const response = await axios.put(url, null, { headers });

    if (response.status === 200 && response.data.status === 'AUTHORIZED') {
      const data  = response.data;
      const order = req.session.currentVendorOrder;

      // Persistir venta en Pedido + DetallePedido
      await prisma.pedido.create({
        data: {
          clienteId:  req.session.usuario.id,      // Vendedor como cliente
          direccion:   "Mostrador",
          telefono:    "N/A",
          tipoEntrega: "RETIRO",
          total:       data.amount,
          estado:      "ENTREGADO",
          detalles: {
            create: order.items.map(i => ({
              productoId: i.productoId,
              cantidad:   i.cantidad,
              subtotal:   i.subtotal
            }))
          }
        }
      });

      // Limpiar carrito vendedor
      req.session.cartVendedor = [];
      delete req.session.currentVendorOrder;

      // Preparar detalle de transacción para la vista
      const transaction_detail = {
        card_number:       data.card_detail.card_number,
        transaction_date:  new Date(data.transaction_date).toLocaleString('es-CL'),
        state:             "ACEPTADO",
        pay_type:          data.payment_type_code === 'VD' ? 'Tarjeta de Débito' : 'Tarjeta de Crédito',
        amount:            Number(data.amount).toLocaleString('es-CL'),
        authorization_code:data.authorization_code,
        buy_order:         data.buy_order
      };

      return res.render('commitpay', { transaction_detail });
    }

    return res.render('commitpay', { transaction_detail: null });
  } catch (err) {
    console.error('Error commitpay vendedor:', err.response?.data || err.message);
    return res.render('commitpay', { transaction_detail: null });
  }
});

module.exports = router;
