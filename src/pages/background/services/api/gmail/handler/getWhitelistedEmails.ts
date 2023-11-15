import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { storageKeys } from '@src/pages/background/constants/app.constants';
import { getLocalStorageByKey } from '@src/pages/background/utils/getStorageByKey';
import { getFilterById } from '../helper/gmailFilters';
import { getFilterId } from '../helper/getFilterId';
import { logger } from '@src/pages/background/utils/logger';

export const getWhitelistedEmails = async (token: string): Promise<string[]> => {
  let filterEmails = [];
  try {
    // get whitelisted emails from local.storage
    const whitelistedEmails = await getLocalStorageByKey<string[]>(storageKeys.WHITELISTED_EMAILS);
    if (whitelistedEmails && whitelistedEmails.length > 0) {
      filterEmails = whitelistedEmails;
    } else {
      // if emails not present in local.storage get it from user's filter (gmail-api)

      // check for whitelisted filter id in sync.storage
      const whitelistFilterId = await getFilterId({ token, filterAction: FILTER_ACTION.INBOX });
      if (whitelistFilterId) {
        // if exists, get emails from filter by id
        const res = await getFilterById(token, whitelistFilterId);
        if (res) {
          // save emails to local.storage
          await chrome.storage.local.set({ [storageKeys.WHITELISTED_EMAILS]: res.emails });
          filterEmails = res.emails;
        } else {
          throw new Error('❌ Failed to get whitelist filter emails');
        }
      } else {
        throw new Error('❌ Failed to get whitelist filter id');
      }
    }
    return filterEmails;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error getting whitelisted emails',
      fileTrace:
        'background/services/api/gmail/handler/getWhitelistedEmails.ts:74 ~ getWhitelistedEmails() catch block',
    });
    return filterEmails;
  }
};
