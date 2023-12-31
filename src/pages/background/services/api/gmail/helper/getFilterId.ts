import { FRESH_INBOX_FILTER_EMAIL, storageKeys } from '@src/pages/background/constants/app.constants';
import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { createFilter } from './gmailFilters';
import { getFreshInboxFilter } from './getFreshInboxFilter';
import { getSyncStorageByKey } from '@src/pages/background/utils/getStorageByKey';
import { checkFilterIdExists } from './checkFilterIdExists';
import { logger } from '@src/pages/background/utils/logger';
import { setStorage } from '@src/pages/background/utils/setStorage';

type GetFilterIdParams = {
  userToken: string;
  filterAction: FILTER_ACTION;
};
// get filter id from storage or gmail filters api
export const getFilterId = async ({ userToken, filterAction }: GetFilterIdParams): Promise<string> => {
  // set storage key based on action
  const storageKey =
    filterAction === FILTER_ACTION.TRASH
      ? storageKeys.UNSUBSCRIBE_FILTER_ID
      : storageKeys.WHITELIST_FILTER_ID;

  try {
    //get id from storage
    const filterId = await getSyncStorageByKey(storageKey);

    // check if filter exists in gmail filters
    if (filterId && (await checkFilterIdExists(userToken, filterId))) {
      return filterId;
    } else {
      // search for whitelist/inbox filter in users filter (gmail-api)
      const res = await getFreshInboxFilter({ userToken, filterAction });

      if (res?.filterId) {
        // save the filterId to sync storage
        await setStorage({ type: 'sync', key: storageKey, value: res.filterId });

        return res.filterId;
      }

      // if not found in storage or in the user's filters, then create new filter with the give action
      const newFilterId = await createFilter({ userToken, filterAction, emails: [FRESH_INBOX_FILTER_EMAIL] });

      if (newFilterId) {
        // save the new filter id to sync storage
        await setStorage({ type: 'sync', key: storageKey, value: newFilterId });

        // return the new filter id
        return newFilterId;
      } else {
        // failed to
        throw new Error('❌ Failed to create new filter');
      }
    }
  } catch (error) {
    logger.error({
      error,
      msg: 'Error getting filter id',
      fileTrace: 'background/services/api/gmail/helper/getFilterId.ts:55 ~ getFilterId() catch block',
    });
  }
};
