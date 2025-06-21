// src/config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurarnos de que la carpeta 'uploads' exista (para evitar ENOENT).
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const permitido = /image\/(jpeg|jpg|png|gif|webp)/i;
  if (permitido.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sólo se permiten imágenes: jpeg/jpg/png/gif/webp'), false);
  }
};

module.exports = multer({ storage, fileFilter });
