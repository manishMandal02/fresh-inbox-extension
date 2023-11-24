import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { storageKeys } from '@src/pages/background/constants/app.constants';
import { getFilterById } from '../helper/gmailFilters';
import { getFilterId } from '../helper/getFilterId';
import { getLocalStorageByKey } from '@src/pages/background/utils/getStorageByKey';
import { logger } from '@src/pages/background/utils/logger';
import { setStorage } from '@src/pages/background/utils/setStorage';

export const getUnsubscribedEmails = async (userToken: string): Promise<string[]> => {
  try {
    // get whitelisted emails from local.storage
    const unsubscribedEmails = await getLocalStorageByKey<string[]>(storageKeys.UNSUBSCRIBED_EMAILS);

    if (unsubscribedEmails && unsubscribedEmails.length > 0) return unsubscribedEmails;

    // if emails not present in local.storage get it from user's filter (gmail-api)

    // check for unsubscribe filter id in sync.storage
    const unsubscribeFilterId = await getFilterId({ userToken, filterAction: FILTER_ACTION.TRASH });
    if (!unsubscribeFilterId) throw new Error('❌ Failed to get unsubscribe filter id');

    //  get emails from filter by id
    const res = await getFilterById(userToken, unsubscribeFilterId);

    if (!res) throw new Error('❌ Failed to get unsubscribe filter emails');
    // save emails to chrome local storage
    await setStorage({ type: 'local', key: storageKeys.UNSUBSCRIBED_EMAILS, value: res.emails });

    return res.emails;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error getting unsubscribed emails',
      fileTrace:
        'background/services/api/gmail/handler/getUnsubscribedEmails.ts:42 ~ getUnsubscribedEmails() catch block',
    });
    return [];
  }
};
