import { prismaClientContainer } from '@/infrastructures/prisma-client.container';
import { Prisma } from '@prisma/client';

const { prismaClient } = prismaClientContainer();

export const serviceFlagRepository = {

  /**
   * Get service flag
   */
  async getServiceFlagByName(name: string) {

    return prismaClient.serviceFlag.findFirst({
      where: {
        name,
      },
    });
  },

  /**
   * Save target providers
   */
  async saveServiceFlag(props: Omit<Prisma.ServiceFlagCreateInput, 'createdAt' | 'updatedAt'>) {
    const { prismaClient } = prismaClientContainer();

    await prismaClient.$transaction(async (prisma) => {

      const serviceFlag = await prisma.serviceFlag.findFirst({
        where: {
          name: props.name,
        },
      });

      if (serviceFlag) {
        await prisma.serviceFlag.update({
          where: {
            id: serviceFlag?.id,
          },
          data: props,
        });
      } else {
        await prisma.serviceFlag.create({
          data: props,
        });
      }
    });
  },

  /**
   * Update LastChecked
   */
  async updatedLastCheckedByName(name: string) {
    const { prismaClient } = prismaClientContainer();

    const serviceFlag = await prismaClient.serviceFlag.findFirstOrThrow({
      where: {
        name,
      },
    });

    await prismaClient.serviceFlag.update({
      where: {
        id: serviceFlag.id,
      },
      data: {
        lastChecked: new Date(),
      },
    });
  },
};
