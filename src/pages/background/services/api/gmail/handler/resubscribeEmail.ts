import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { addEmailToFilter, removeEmailFromFilter } from '../helper/updateFilter';
import { getFilterId } from '../helper/getFilterId';
import { logger } from '@src/pages/background/utils/logger';

// TODO: check if already re-Subscribed, if yes do nothing (update storage)

// handle resubscribe
export const resubscribeEmail = async (token: string, email: string) => {
  try {
    // remove email from unsubscribe filter
    const unsubscribeFilterId = await getFilterId({ token, filterAction: FILTER_ACTION.TRASH });
    await removeEmailFromFilter({
      token,
      email,
      filterId: unsubscribeFilterId,
      filterAction: FILTER_ACTION.TRASH,
    });

    // add email to whitelist filter
    const whitelistFilterId = await getFilterId({ token, filterAction: FILTER_ACTION.INBOX });
    await addEmailToFilter({
      token,
      email,
      filterId: whitelistFilterId,
      filterAction: FILTER_ACTION.INBOX,
    });
    return true;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error while resubscribing email',
      fileTrace:
        'background/services/api/gmail/handler/resubscribeEmail.ts:33 resubscribeEmail() catch block',
    });
    return false;
  }
};
