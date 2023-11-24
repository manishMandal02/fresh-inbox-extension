import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { storageKeys } from '@src/pages/background/constants/app.constants';
import { getLocalStorageByKey } from '@src/pages/background/utils/getStorageByKey';
import { getFilterById } from '../helper/gmailFilters';
import { getFilterId } from '../helper/getFilterId';
import { logger } from '@src/pages/background/utils/logger';
import { setStorage } from '@src/pages/background/utils/setStorage';

export const getWhitelistedEmails = async (userToken: string): Promise<string[]> => {
  try {
    // get whitelisted emails from local.storage
    const whitelistedEmails = await getLocalStorageByKey<string[]>(storageKeys.WHITELISTED_EMAILS);
    if (whitelistedEmails && whitelistedEmails.length > 0) return whitelistedEmails;
    // if emails not present in local.storage get it from user's filter (gmail-api)

    // check for whitelisted filter id in sync.storage
    const whitelistFilterId = await getFilterId({ userToken, filterAction: FILTER_ACTION.INBOX });
    if (!whitelistFilterId) throw new Error('❌ Failed to get whitelist filter id');

    //  get emails from filter by id
    const res = await getFilterById(userToken, whitelistFilterId);

    if (!res) throw new Error('❌ Failed to get whitelist filter emails');

    // save emails to chrome local storage
    await setStorage({ type: 'local', key: storageKeys.WHITELISTED_EMAILS, value: res.emails });

    return res.emails;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error getting whitelisted emails',
      fileTrace:
        'background/services/api/gmail/handler/getWhitelistedEmails.ts:74 ~ getWhitelistedEmails() catch block',
    });
    return [];
  }
};
