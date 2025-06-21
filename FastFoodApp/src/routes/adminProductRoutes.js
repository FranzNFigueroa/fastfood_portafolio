// src/routes/adminProductRoutes.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const adminProductoCtrl = require('../controllers/adminProductoController');

// Todas las rutas de /admin/productos requieren que el usuario esté AUTENTICADO y con ROL = ADMIN
router.use(ensureAuthenticated, ensureRole('ADMIN'));

// GET /admin/productos   → Listar
router.get('/', adminProductoCtrl.list);

// GET /admin/productos/nuevo   → Mostrar formulario de creación
router.get('/nuevo', adminProductoCtrl.showCreateForm);

// POST /admin/productos   → Procesar creación
router.post('/', upload.single('imagen'), adminProductoCtrl.create);

// GET /admin/productos/:id/editar   → Mostrar formulario de edición
router.get('/:id/editar', adminProductoCtrl.showEditForm);

// POST /admin/productos/:id   → Procesar actualización
router.post('/:id', upload.single('imagen'), adminProductoCtrl.update);

// POST /admin/productos/:id/eliminar   → Eliminar
router.post('/:id/eliminar', adminProductoCtrl.remove);

module.exports = router;
