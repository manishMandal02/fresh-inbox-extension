//

import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { getFilterId } from './getFilterId';
import { logger } from '@src/pages/background/utils/logger';
import { setStorage } from '@src/pages/background/utils/setStorage';
import { storageKeys } from '@src/pages/background/constants/app.constants';

// checks if app custom filter exists, if not create it (after successful auth)
export const checkFreshInboxFilters = async (userToken: string) => {
  try {
    const promises = [
      // unsubscribe filter
      getFilterId({ userToken, filterAction: FILTER_ACTION.TRASH }),
      // whitelist filter
      getFilterId({ userToken, filterAction: FILTER_ACTION.INBOX }),
      // also check for preference (alert msg for delete actions)
      setStorage({ type: 'sync', key: storageKeys.DONT_SHOW_DELETE_CONFIRM_MSG, value: false }),
    ];

    // wait for all promises to resolve
    // throw error if any of the promises reject to catch in the catch block
    await Promise.all(promises.map(promise => promise.catch(err => err)));

    logger.info('✅ Successfully checked for FreshInbox filters after auth.');

    return true;
  } catch (error) {
    logger.error({
      error,
      msg: 'Failed to initialize storage',
      fileTrace: 'background/index.ts:37 ~ initializeStorage() - catch block',
    });
    return false;
  }
};
