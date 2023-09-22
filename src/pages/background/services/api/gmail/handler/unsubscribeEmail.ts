import { storageKeys } from '@src/pages/background/constants/app.constants';
import { APIHandleParams, FILTER_ACTION } from '@src/pages/background/types/background.types';
import { getLocalStorageByKey } from '@src/pages/background/utils/getStorageByKey';
import { getFilterId } from '../helper/getFilterId';
import { getWhitelistedEmails } from './getWhitelistedEmails';
import { addEmailToFilter, removeEmailFromFilter } from '../helper/updateFilter';

type UnsubscribeEmailParams = {
  isWhiteListed: boolean;
} & APIHandleParams;

// handle unsubscribe/block email
export const unsubscribeEmail = async ({ token, email, isWhiteListed }: UnsubscribeEmailParams) => {
  try {
    // check if mail-magic filter id exists in storage
    const filterId = await getFilterId({ token, filterAction: FILTER_ACTION.TRASH });

    console.log('🚀 ~ file: unsubscribeEmail.ts:18 ~ unsubscribeEmail ~ filterId:', filterId);

    if (filterId) {
      // update filter: add email to filter
      await addEmailToFilter({ token, filterId, email, filterAction: FILTER_ACTION.TRASH });

      // check if the email exists in the newsletters list (local.storage), if yes remove it
      const newsletterEmails = await getLocalStorageByKey<string[]>(storageKeys.NEWSLETTER_EMAILS);

      console.log(
        '🚀 ~ file: unsubscribeEmail.ts:27 ~ unsubscribeEmail ~ newsletterEmails:',
        newsletterEmails
      );

      if (newsletterEmails && newsletterEmails.length > 0 && newsletterEmails.includes(email)) {
        // remove the email from newsletter list
        const updatedNewsletterEmails = newsletterEmails.filter(e => e !== email);
        // save updated newsletter emails
        await chrome.storage.local.set({ [storageKeys.NEWSLETTER_EMAILS]: updatedNewsletterEmails });
      }

      // check the isWhiteListed flag: if present, remove email from the whitelist filter as well
      if (isWhiteListed) {
        const whitelistedEmails = await getWhitelistedEmails(token);
        if (whitelistedEmails && whitelistedEmails.includes(email)) {
          // get whitelist filter id
          const whitelistFilterId = await getFilterId({ token, filterAction: FILTER_ACTION.INBOX });
          // remove email from whitelist filter
          await removeEmailFromFilter({
            token,
            filterId: whitelistFilterId,
            email,
            filterAction: FILTER_ACTION.TRASH,
          });
        }
      }

      // check if this email is whitelisted
      return true;
    } else {
      throw new Error('❌ Failed to get unsubscribe filter id');
    }
  } catch (err) {
    console.log('🚀 ~ file: gmail.ts:152 ~ unsubscribe ❌ Failed to unsubscribe ~ err:', err);
    //TODO: send to global error handler
    return false;
  }
};
