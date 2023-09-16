import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { addEmailToFilter, removeEmailFromFilter } from '../helper/updateFilter';
import { getFilterId } from '../helper/getFilterId';

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
  } catch (err) {
    console.log('🚀 ~ file: resubscribeEmail.ts:12 ~ resubscribeEmail ~ err:', err);
    //TODO: send to global error handler
    return false;
  }
};
