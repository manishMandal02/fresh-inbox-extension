import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { getMailMagicFilter } from './helpers/getMailMagicFilter';

export const getWhitelistedEmails = async (token: string) => {
  try {
    const filterEmails = await getMailMagicFilter({ token, filterAction: FILTER_ACTION.INBOX });

    if (filterEmails) {
      return filterEmails;
    } else {
      throw new Error('❌ Failed to fetch whitelisted emails');
    }
  } catch (err) {
    console.log('🚀 ~ file: getWhitelistedEmails.ts:15 ~ getWhitelistedEmails ~ err:', err);
  }
};
