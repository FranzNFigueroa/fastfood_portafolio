// src/controllers/adminController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  statsVentas: async (req, res) => {
    try {
      const hoy = new Date();
      const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - 7);
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

      // Traer TODOS los detalles de pedido con fecha y producto
      const todosDetalles = await prisma.detallePedido.findMany({
        include: {
          pedido: { select: { creadoEn: true } },
          producto: { select: { nombre: true } }
        },
        orderBy: { pedido: { creadoEn: 'desc' } }
      });

      // Filtrar según rango
      const detallesHoy    = [];
      const detallesSemana = [];
      const detallesMes    = [];
      todosDetalles.forEach(d => {
        const fecha = d.pedido.creadoEn;
        if (fecha >= inicioMes)    detallesMes.push(d);
        if (fecha >= inicioSemana) detallesSemana.push(d);
        if (fecha >= inicioDia)    detallesHoy.push(d);
      });

      // Totales
      const totalHoy    = detallesHoy.reduce((s, d) => s + d.subtotal, 0);
      const totalSemana = detallesSemana.reduce((s, d) => s + d.subtotal, 0);
      const totalMes    = detallesMes.reduce((s, d) => s + d.subtotal, 0);

      // Top 5 productos globales
      const topRaw = await prisma.detallePedido.groupBy({
        by: ['productoId'],
        _sum: { cantidad: true },
        orderBy: { _sum: { cantidad: 'desc' } },
        take: 5
      });
      const topProductos = await Promise.all(
        topRaw.map(async t => {
          const prod = await prisma.producto.findUnique({ where: { id: t.productoId } });
          return { nombre: prod.nombre, totalVendido: t._sum.cantidad };
        })
      );

      res.render('admin/home', {
        detallesHoy,
        detallesSemana,
        detallesMes,
        totalHoy,
        totalSemana,
        totalMes,
        topProductos
      });
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      res.status(500).send('Error al cargar dashboard');
    }
  }
};
