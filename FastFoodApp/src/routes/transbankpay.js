const express = require('express');
const router = express.Router();
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Cabecera solicitada por Transbank
const headers = {
  "Authorization": "Token",
  "Tbk-Api-Key-Id": "597055555532",
  "Tbk-Api-Key-Secret": "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Referrer-Policy": "origin-when-cross-origin"
};

// Mostrar formulario (solo para pruebas)
router.get('/transbankpay', (req, res) => {
  res.render('transbankpay', { monto: 35000 });
});

// Enlace desde carrito
router.post('/checkout', async (req, res) => {
  const carrito = req.session.carrito || [];
  const monto = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  const data = {
    amount: Number(monto),
    buy_order: `orden_${Date.now()}`,
    session_id: `session_${Date.now()}`,
    return_url: "http://localhost:3000/commitpay"
  };

  try {
    const response = await axios.post(
      "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions",
      data,
      { headers }
    );

    res.render('sendpay', {
      transbank: {
        url: response.data.url,
        token: response.data.token
      },
      amount: monto
    });

  } catch (error) {
    console.error('Error al crear transacción:', error.response?.data || error.message);
    res.status(500).send('Error al iniciar el pago con Transbank');
  }
});

// Confirmar pago (commit)
router.get('/commitpay', async (req, res) => {
  try {
    const tokenws = req.query.token_ws;
    if (!tokenws) {
      return res.render('commitpay', { transaction_detail: null, order: [] });
    }

    const url = `https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${tokenws}`;
    const response = await axios.put(url, null, { headers });

    if (response.status === 200 && response.data.status === 'AUTHORIZED') {
      const dataTB = response.data;
      const usuario = req.session.usuario;
      const carrito = req.session.carrito || [];

      // Preparamos la orden para la vista
      const order = carrito.map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        subtotal: item.subtotal
      }));

      if (usuario && carrito.length > 0) {
        // 1) Creamos el pedido y sus detalles en la BD
        await prisma.pedido.create({
          data: {
            clienteId: usuario.id,
            direccion: usuario.direccion || '',
            telefono: usuario.telefono || '',
            tipoEntrega: 'RETIRO',
            total: Number(dataTB.amount),
            estado: 'ENTREGADO',
            detalles: {
              create: carrito.map(item => ({
                productoId: item.productoId,
                cantidad: item.cantidad,
                subtotal: item.subtotal
              }))
            }
          }
        });

        // 2) Descontamos stock de cada producto
        await Promise.all(
          carrito.map(item =>
            prisma.producto.update({
              where: { id: item.productoId },
              data: { stock: { decrement: item.cantidad } }
            })
          )
        );

        // 3) Limpiamos carrito de sesión
        req.session.carrito = [];
      }

      // Preparamos detalle de la transacción para la vista
      const transaction_detail = {
        card_number:        dataTB.card_detail.card_number,
        transaction_date:   new Date(dataTB.transaction_date).toLocaleString('es-CL'),
        state:              'ACEPTADO',
        pay_type:           dataTB.payment_type_code === 'VD' ? 'Tarjeta de Débito' : 'Tarjeta de Crédito',
        amount:             Number(dataTB.amount).toLocaleString('es-CL'),
        authorization_code: dataTB.authorization_code,
        buy_order:          dataTB.buy_order
      };

      return res.render('commitpay', { transaction_detail, order });
    }

    // Si no está autorizado
    return res.render('commitpay', { transaction_detail: null, order: [] });

  } catch (err) {
    console.error('❌ Error commitpay:', err.response?.data || err.message);
    return res.render('commitpay', { transaction_detail: null, order: [] });
  }
});

module.exports = router;
