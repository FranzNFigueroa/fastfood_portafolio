// app.js
require('dotenv').config();  // Carga variables de entorno

const express      = require('express');
const session      = require('express-session');
const cookieParser = require('cookie-parser');
const helmet       = require('helmet');
const morgan       = require('morgan');
const path         = require('path');
const ejsLayouts   = require('express-ejs-layouts');

const app = express();

// 1. Seguridad y logs
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc:   ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc:     ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc:    ["'self'", "https://cdn.jsdelivr.net"],
      objectSrc:  ["'none'"],
      formAction: ["'self'", "https://webpay3gint.transbank.cl"], // Permite enviar formularios a Transbank
    }
  }
}));
app.use(morgan('dev'));

// 2. Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3. Cookies y sesión
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecreto123',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// 4. Variables globales para vistas
app.use((req, res, next) => {
  res.locals.usuario    = req.session.usuario || null;
  res.locals.registered = req.query.registered || null;
  res.locals.welcome    = req.query.welcome || null;
  res.locals.error      = req.query.error || null;
  res.locals.carrito    = req.session.carrito || [];
  next();
});

// 5. Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'src', 'public', 'uploads')));

// 6. EJS + Layouts
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('layout', 'layouts/cliente');

// 7. Rutas –– Importar antes de montar
const authRoutes             = require('./src/routes/authRoutes');
const carritoRoutes          = require('./src/routes/carritoRoutes');
const vendorRoutes           = require('./src/routes/vendorRoutes');
const adminProductRoutes     = require('./src/routes/adminProductRoutes');
const adminRoutes            = require('./src/routes/adminRoutes');
const pagoClienteRoutes      = require('./src/routes/transbankpay');
const pagoVendedorRoutes     = require('./src/routes/vendorTransbank');

// 8. Montaje de rutas
app.use('/', authRoutes);
// Catálogo + carrito (cliente)
app.use(['/productos', '/carrito'], carritoRoutes);
// Funcionalidades de vendedor (login, agregar, eliminar en efectivo)
app.use('/vendedor', vendorRoutes);
// Dashboard admin y manejo de productos
app.use('/admin/productos', adminProductRoutes);
app.use('/admin', adminRoutes);
// Flujos de pago con tarjeta
app.use('/', pagoClienteRoutes);      // cliente
app.use('/', pagoVendedorRoutes);     // vendedor

// 9. Página 404
app.use((req, res, next) => {
  res.status(404).render('404', { layout: false, url: req.originalUrl });
});

// 10. Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('❌ Error general:', err.stack);
  res.status(500).render('500', { layout: false, error: err });
});

// 11. Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
