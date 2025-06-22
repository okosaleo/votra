// lib/prisma.ts
import { PrismaClient }   from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// create the extended client
const client = new PrismaClient().$extends(withAccelerate());
// infer its full type (including all extension methods)
type PrismaAccelerated = typeof client;

declare global {
  // now global.prisma can hold exactly that type
  var prisma: PrismaAccelerated | undefined;
}

export const prisma = global.prisma || client;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}



