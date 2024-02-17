import { prismaClientContainer } from '@/infrastructures/prisma-client.container';
import { Prisma } from '@prisma/client';

export const targetProviderRepository = {

  /**
   * Get target providers
   */
  async getTargetProviders() {
    const { prismaClient } = prismaClientContainer();
    return prismaClient.targetProvider.findMany();
  },

  /**
   * Save target providers
   */
  async saveTargetProviders(targetProviders: Prisma.TargetProviderCreateInput[]) {
    const { prismaClient } = prismaClientContainer();
    await prismaClient.$transaction(async (prisma) => {
      await prisma.targetProvider.deleteMany({});
      await Promise.all(targetProviders.map(async (value) => {
        await prisma.targetProvider.create({ data: value });
      }));
    });
  },

};
