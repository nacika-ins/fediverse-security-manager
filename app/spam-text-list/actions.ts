'use server';

import { spamTextRepository } from '@/repositories/spam-text.repository';

export async function saveSpamTexts(spamTexts: string[]) {
  await spamTextRepository.saveSpamTexts(spamTexts);
}

export async function getSpamTexts() {
  return spamTextRepository.getSpamTexts();
}
