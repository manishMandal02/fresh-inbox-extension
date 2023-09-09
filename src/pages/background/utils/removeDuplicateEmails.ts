import { NewsletterEmails } from '../services/api/gmail';

const removeDuplicateEmails = (arr: NewsletterEmails[]) => {
  return arr.filter((v, i, a) => a.findIndex(v2 => v2.email === v.email) === i);
};

export { removeDuplicateEmails };
