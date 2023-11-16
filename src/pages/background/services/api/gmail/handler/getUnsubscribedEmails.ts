import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { FRESH_INBOX_FILTER_EMAIL, storageKeys } from '@src/pages/background/constants/app.constants';
import { getFilterById } from '../helper/gmailFilters';
import { getFilterId } from '../helper/getFilterId';
import { getLocalStorageByKey } from '@src/pages/background/utils/getStorageByKey';
import { logger } from '@src/pages/background/utils/logger';

export const getUnsubscribedEmails = async (token: string): Promise<string[]> => {
  let filterEmails = [];
  try {
    // get whitelisted emails from local.storage
    const unsubscribedEmails = await getLocalStorageByKey<string[]>(storageKeys.UNSUBSCRIBED_EMAILS);

    console.log("🚀 ~ file: getUnsubscribedEmails.ts:14 ~ getUnsubscribedEmails ~ unsubscribedEmails:", unsubscribedEmails);

    if (unsubscribedEmails && unsubscribedEmails.length > 0) {
      filterEmails = unsubscribedEmails;
    } else {
      // if emails not present in local.storage get it from user's filter (gmail-api)

      // check for unsubscribe filter id in sync.storage
      const unsubscribeFilterId = await getFilterId({ token, filterAction: FILTER_ACTION.TRASH });
      if (unsubscribeFilterId) {
        // if exists, get emails from filter by id
        const res = await getFilterById(token, unsubscribeFilterId);

        if (res) {
          // save emails to local.storage
          await chrome.storage.local.set({ [storageKeys.UNSUBSCRIBED_EMAILS]: res.emails });
          filterEmails = res.emails;
        } else {
          throw new Error('❌ Failed to get unsubscribe filter emails');
        }
      } else {
        throw new Error('❌ Failed to get unsubscribe filter id');
      }
    }
    return filterEmails;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error getting unsubscribed emails',
      fileTrace:
        'background/services/api/gmail/handler/getUnsubscribedEmails.ts:42 ~ getUnsubscribedEmails() catch block',
    });
    return filterEmails;
  }
};
