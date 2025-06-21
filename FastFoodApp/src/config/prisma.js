require('dotenv').config();  // ensure .env loaded
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;