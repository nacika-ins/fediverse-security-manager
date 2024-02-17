'use server';

import { PrismaClient } from '@prisma/client';

const prismaClient: PrismaClient | null = null;

/**
 * Prisma client container
 * TODO: Replace this with a real DI container
 */
export const prismaClientContainer = (): { prismaClient: PrismaClient } => {
  if (!prismaClient) {
    return { prismaClient: new PrismaClient() };
  }

  return { prismaClient };
};
