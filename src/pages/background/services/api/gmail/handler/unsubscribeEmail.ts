import { storageKeys } from '@src/pages/background/constants/app.constants';
import {
  APIHandleParams,
  FILTER_ACTION,
  NewsletterEmails,
} from '@src/pages/background/types/background.types';
import { getLocalStorageByKey } from '@src/pages/background/utils/getStorageByKey';
import { getFilterId } from '../helper/getFilterId';
import { getWhitelistedEmails } from './getWhitelistedEmails';
import { addEmailToFilter, removeEmailFromFilter } from '../helper/updateFilter';
import { logger } from '@src/pages/background/utils/logger';

type UnsubscribeEmailParams = {
  isWhiteListed: boolean;
} & APIHandleParams;

// TODO: check if already unsubscribed, if yes do nothing (update storage)

// handle unsubscribe/block email
export const unsubscribeEmail = async ({ token, email, isWhiteListed }: UnsubscribeEmailParams) => {
  try {
    // check if fresh-Inbox filter id exists in storage
    const filterId = await getFilterId({ token, filterAction: FILTER_ACTION.TRASH });

    if (filterId) {
      // update filter: add email to filter
      await addEmailToFilter({ token, filterId, email, filterAction: FILTER_ACTION.TRASH });

      // check if the email exists in the newsletters list (local.storage), if yes remove it
      const newsletterEmails = await getLocalStorageByKey<NewsletterEmails[]>(storageKeys.NEWSLETTER_EMAILS);

      if (
        newsletterEmails &&
        newsletterEmails.length > 0 &&
        !!newsletterEmails.find(e => e.email === email)
      ) {
        // remove the email from newsletter list
        const updatedNewsletterEmails = newsletterEmails.filter(e => e.email !== email);
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
  } catch (error) {
    logger.error({
      error,
      msg: `Error unsubscribing email: ${email}`,
      fileTrace:
        'background/services/api/gmail/handler/unsubscribeEmail.ts:69 ~ unsubscribeEmail() catch block',
    });
    return false;
  }
};
