import { prismaClientContainer } from '@/infrastructures/prisma-client.container';

export const spamTextRepository = {

  /**
   * Get spam texts
   */
  async getSpamTexts() {
    const { prismaClient } = prismaClientContainer();
    const spamTexts = await prismaClient.spamText.findMany();
    return spamTexts.map((value) => value.text).filter((value) => value);
  },

  /**
   * Save spam texts
   */
  async saveSpamTexts(spamTexts: string[]) {
    const { prismaClient } = prismaClientContainer();
    await prismaClient.$transaction(async (prisma) => {
      await prisma.spamText.deleteMany({});
      await Promise.all(spamTexts.map(async (value) => {
        await prisma.spamText.create({ data: { text: value } });
      }));
    });
  },
};
