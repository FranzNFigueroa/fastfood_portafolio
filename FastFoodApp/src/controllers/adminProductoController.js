// src/controllers/adminProductoController.js
const prisma = require('../config/prisma');

module.exports = {
  // Listar todos los productos (incluye bebida y formato)
  list: async (req, res) => {
    try {
      const productos = await prisma.producto.findMany({
        include: { bebida: true },
        orderBy: { id: 'asc' }
      });
      res.render('admin/productos/list', {
        productos,
        usuario: req.session.usuario
      });
    } catch (error) {
      console.error('Error al listar productos:', error);
      return res.status(500).send('Error interno al listar productos');
    }
  },

  // Formulario de creación
  showCreateForm: async (req, res) => {
    try {
      const bebidas = await prisma.bebida.findMany({ orderBy: { nombre: 'asc' } });
      res.render('admin/productos/form', {
        producto: {},
        bebidas,
        usuario: req.session.usuario
      });
    } catch (error) {
      console.error('Error al cargar formulario de creación:', error);
      return res.status(500).send('Error interno');
    }
  },

  // Crear producto
  create: async (req, res) => {
    try {
      const { nombre, descripcion, precio, stock, formato } = req.body;
      let bebidaId = null;
      // Determinar bebida
      if (req.body.bebidaSelect) {
        if (req.body.bebidaSelect === 'otro' && req.body.nuevaBebida) {
          const nueva = await prisma.bebida.create({ data: { nombre: req.body.nuevaBebida.trim() } });
          bebidaId = nueva.id;
        } else if (req.body.bebidaSelect && req.body.bebidaSelect !== 'otro') {
          bebidaId = parseInt(req.body.bebidaSelect, 10);
        }
      }

      const data = {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        precio: parseFloat(precio),
        bebidaId,
        formatoBebida: bebidaId ? formato : null,
        imagen: req.file ? req.file.filename : null
      };
      if (stock) data.stock = parseInt(stock, 10);

      await prisma.producto.create({ data });
      res.redirect('/admin/productos');
    } catch (error) {
      console.error('Error al crear producto:', error);
      return res.status(500).send('Error interno al crear producto');
    }
  },

  // Formulario de edición
  showEditForm: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const producto = await prisma.producto.findUnique({
        where: { id },
        include: { bebida: true }
      });
      if (!producto) return res.status(404).send('Producto no encontrado');
      const bebidas = await prisma.bebida.findMany({ orderBy: { nombre: 'asc' } });
      res.render('admin/productos/form', { producto, bebidas, usuario: req.session.usuario });
    } catch (error) {
      console.error('Error al cargar formulario de edición:', error);
      return res.status(500).send('Error interno');
    }
  },

  // Actualizar producto
  update: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { nombre, descripcion, precio, stock, formato } = req.body;
      let bebidaId = null;
      if (req.body.bebidaSelect) {
        if (req.body.bebidaSelect === 'otro' && req.body.nuevaBebida) {
          const nueva = await prisma.bebida.create({ data: { nombre: req.body.nuevaBebida.trim() } });
          bebidaId = nueva.id;
        } else if (req.body.bebidaSelect && req.body.bebidaSelect !== 'otro') {
          bebidaId = parseInt(req.body.bebidaSelect, 10);
        }
      }

      const data = {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        precio: parseFloat(precio),
        bebidaId,
        formatoBebida: bebidaId ? formato : null
      };
      if (req.file) data.imagen = req.file.filename;
      data.stock = stock ? parseInt(stock, 10) : null;

      await prisma.producto.update({ where: { id }, data });
      res.redirect('/admin/productos');
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(500).send('Error interno al actualizar producto');
    }
  },

  // Eliminar producto
  remove: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await prisma.producto.delete({ where: { id } });
      res.redirect('/admin/productos');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return res.status(500).send('Error interno al eliminar producto');
    }
  }
};