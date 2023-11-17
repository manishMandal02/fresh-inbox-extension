import type { INewsletterEmails } from '../types/background.types';

const removeDuplicateEmails = (arr: INewsletterEmails[]) => {
  return arr.filter((v, i, a) => a.findIndex(v2 => v2.email === v.email) === i);
};

export { removeDuplicateEmails };
