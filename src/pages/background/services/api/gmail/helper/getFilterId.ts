import { MAIL_MAGIC_FILTER_EMAIL, storageKeys } from '@src/pages/background/constants/app.constants';
import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { createFilter } from './gmailFilters';
import { getMailMagicFilter } from './getMailMagicFilter';
import { getSyncStorageByKey } from '@src/pages/background/utils/getStorageByKey';
import { checkFilterIdExists } from './checkFilterIdExists';

type GetFilterIdParams = {
  token: string;
  filterAction: FILTER_ACTION;
};
// get filter id from storage or gmail filters api
export const getFilterId = async ({ token, filterAction }: GetFilterIdParams): Promise<string> => {
  const storageKey =
    filterAction === FILTER_ACTION.TRASH
      ? storageKeys.UNSUBSCRIBE_FILTER_ID
      : storageKeys.WHITELIST_FILTER_ID;

  try {
    //get id from storage
    const filterId = await getSyncStorageByKey(storageKey);
    if (filterId && (await checkFilterIdExists(token, filterId))) {
      // check if filter with this id exists
      // if yes, return id

      // if not
      // return filter id if present
      return filterId;
    } else {
      // search for whitelist/inbox filter in users filter (gmail-api)
      const res = await getMailMagicFilter({ token, filterAction });
      if (res?.filterId) {
        // save to sync storage
        await chrome.storage.sync.set({ [storageKey]: res.filterId });

        return res.filterId;
      }

      // if not found in storage or in the user's filters, then create new filter with the give action
      const newFilterId = await createFilter({ token, filterAction, emails: [MAIL_MAGIC_FILTER_EMAIL] });

      console.log('🚀 ~ file: getFilterId.ts:42 ~ getFilterId ~ newFilterId:', newFilterId);

      if (newFilterId) {
        // save the new filter id to sync storage
        await chrome.storage.sync.set({ [storageKey]: newFilterId });
        // return the new filter id
        return newFilterId;
      } else {
        // failed to
        throw new Error('❌ Failed to create new filter');
      }
    }
  } catch (err) {
    console.log('🚀 ~ file: getFilterId.ts:21 ~ getFilterId ~ err:', err);
    //TODO: send global error handler
  }
};
