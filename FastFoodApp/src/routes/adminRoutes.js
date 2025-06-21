// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureRole } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

// Dashboard Admin (GET /admin)
router.get(
'/',
ensureAuthenticated,
ensureRole('ADMIN'),
adminController.statsVentas
);

module.exports = router;