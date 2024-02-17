import { spamTextRepository } from '@/repositories/spam-text.repository';

console.log('watch.ts');
(async () => {

  const spamTexts = await spamTextRepository.getSpamTexts();
  console.debug('spamTexts =', spamTexts);

})();
