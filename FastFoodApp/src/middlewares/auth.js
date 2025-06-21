// src/middlewares/auth.js
module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.session.usuario) return next();
    res.redirect('/');
  },

  ensureRole: (role) => (req, res, next) => {
    if (req.session.usuario && req.session.usuario.rol === role) {
      return next();
    }
    res.status(403).send('Acceso denegado');
  }
};
