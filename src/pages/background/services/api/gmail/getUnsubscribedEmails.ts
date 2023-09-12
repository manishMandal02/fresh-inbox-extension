import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { getMailMagicFilter } from './helpers/getMailMagicFilter';

export const getUnsubscribedEmails = async (token: string): Promise<string[]> => {
  try {
    const unsubscribedEmails = await getMailMagicFilter({ token, filterAction: FILTER_ACTION.TRASH });
    if (unsubscribedEmails) {
      return unsubscribedEmails.emails;
    } else {
      throw new Error('❌ Failed to fetch unsubscribed emails');
    }
  } catch (err) {
    console.log('🚀 ~ file: getUnsubscribedEmails.ts:9 ~ getUnsubscribedEmails ~ err:', err);
  }
};
