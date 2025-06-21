// scripts/resetProductos.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('→ Eliminando todos los DetallePedido…');
  await prisma.detallePedido.deleteMany({});
  console.log('→ Eliminando todas las Resena…');
  await prisma.resena.deleteMany({});
  console.log('→ Eliminando todos los Productos…');
  await prisma.producto.deleteMany({});
  // Si hubiera otras relaciones con productos, repítelo aquí (por ejemplo, pedidos directos)
  console.log('¡✅ Productos (y sus resenas/detalles) han sido eliminados!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
