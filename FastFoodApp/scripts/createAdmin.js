// scripts/createAdmin.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Duoc1234', 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Admin',
      correo: 'admin@fastfood.cl',
      password: hashedPassword,
      rol: 'ADMIN',
      direccion: 'pasaje las acacias #2454',
      telefono: '980808080',
      // createdAt se genera automáticamente si así está definido en tu schema
    },
  });

  console.log('Usuario admin creado:', admin);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
