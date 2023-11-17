//

import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { getFilterId } from './getFilterId';
import { logger } from '@src/pages/background/utils/logger';

// checks if app custom filter exists, if not create it (after successful auth)
export const checkFreshInboxFilters = async (token: string) => {
  try {
    const promises = [
      // unsubscribe filter
      getFilterId({ token, filterAction: FILTER_ACTION.TRASH }),
      // whitelist filter
      getFilterId({ token, filterAction: FILTER_ACTION.INBOX }),
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
