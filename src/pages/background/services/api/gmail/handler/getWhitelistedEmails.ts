import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { storageKeys } from '@src/pages/background/constants/app.constants';
import { getLocalStorageByKey } from '@src/pages/background/utils/getStorageByKey';
import { getFilterById } from '../helper/gmailFilters';
import { getFilterId } from '../helper/getFilterId';

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
  } catch (err) {
    console.log('🚀 ~ file: getWhitelistedEmails.ts:26 ~ getWhitelistedEmails ~ err:', err);
    return filterEmails;
    //TODO: send to global error handler
  }
};
