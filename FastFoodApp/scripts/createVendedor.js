// scripts/createVendedor.js

// 1) Carga variables de entorno (asegúrate de tener un .env con DATABASE_URL)
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 2) Hashea la contraseña
  const hashedPassword = await bcrypt.hash('Duoc1234', 10);

  // 3) Crea el usuario y AWAIT para que se ejecute
  const vendedor = await prisma.usuario.create({
    data: {
      nombre:    'Vendedor',
      correo:    'vendedor@fastfood.cl',
      password:  hashedPassword,
      rol:       'VENDEDOR',
      direccion: 'calle fortuna #2454',
      telefono:  '970707070'
      // createdAt se genera automáticamente
    },
  });

  console.log('Usuario vendedor creado:', vendedor);
}

main()
  .catch((e) => {
    console.error('Error creando vendedor:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
