'use server';

import { PrismaClient } from '@prisma/client';

// eslint-disable-next-line no-var
var prismaClient: PrismaClient | null = null;

/**
 * Prisma client container
 * TODO: Replace this with a real DI container
 */
export const prismaClientContainer = (): { prismaClient: PrismaClient } => {
  if (!prismaClient) {
    return { prismaClient: new PrismaClient({
      log: ['query', 'info', 'warn'],
      errorFormat: 'pretty',
    }) };
  }
  prismaClient.$connect();

  return { prismaClient };
};
