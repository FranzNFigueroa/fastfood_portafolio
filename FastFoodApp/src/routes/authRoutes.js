// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// --- LOGIN / REGISTRO / LOGOUT ---
router.post('/registro', authController.register);
router.post('/login',    authController.login);
router.post('/logout',   (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// --- REDIRECCIONES para GET /registro y GET /login ---
router.get('/registro', (req, res) => res.redirect('/'));
router.get('/login',    (req, res) => res.redirect('/'));

// --- PÁGINA PÚBLICA DE INICIO ---
router.get('/', (req, res) => {
  res.render('cliente/home');
});

module.exports = router;
