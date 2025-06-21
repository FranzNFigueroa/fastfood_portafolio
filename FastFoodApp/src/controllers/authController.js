// src/controllers/authController.js
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  register: async (req, res) => {
    const { nombre, email, password, telefono, direccion } = req.body;
    try {
      // Verificar duplicado
      const existe = await prisma.usuario.findUnique({ where: { correo: email } });
      if (existe) return res.redirect('/?error=correo_existe');

      const hashed = await bcrypt.hash(password, 10);
      await prisma.usuario.create({
        data: { nombre, correo: email, password: hashed, telefono, direccion, rol: 'CLIENTE' }
      });

      res.redirect('/?registered=true');
    } catch (err) {
      console.error('Error en registro:', err);
      res.redirect('/?error=registro');
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.usuario.findUnique({ where: { correo: email } });
      if (!user) return res.redirect('/?error=usuario');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.redirect('/?error=password');

      req.session.usuario = { id: user.id, nombre: user.nombre, rol: user.rol };

      // Redirección según rol
      switch (user.rol) {
        case 'CLIENTE':   return res.redirect('/productos?welcome=true');
        case 'VENDEDOR':  return res.redirect('/vendedor');
        case 'ADMIN':     return res.redirect('/admin');
        default:          return res.redirect('/?error=rol');
      }
    } catch (err) {
      console.error('Error en login:', err);
      res.redirect('/?error=login');
    }
  }
};