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
      objectSrc:  ["'none'"]
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

// 7. Rutas
const authRoutes         = require('./src/routes/authRoutes');
const carritoRoutes      = require('./src/routes/carritoRoutes');
const vendorRoutes       = require('./src/routes/vendorRoutes');
const adminRoutes        = require('./src/routes/adminRoutes');
const adminProductRoutes = require('./src/routes/adminProductRoutes');

app.use('/', authRoutes);
// Unificamos catálogo y carrito en la misma vista:
app.use(['/productos', '/carrito'], carritoRoutes);
app.use('/vendedor', vendorRoutes);
app.use('/admin/productos', adminProductRoutes);
app.use('/admin', adminRoutes);

// 8. Página 404
app.use((req, res, next) => {
  res.status(404).render('404', { layout: false, url: req.originalUrl });
});

// 9. Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('❌ Error general:', err.stack);
  res.status(500).render('500', { layout: false, error: err });
});

// 10. Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
