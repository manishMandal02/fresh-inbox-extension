import { storageKeys } from '@src/pages/background/constants/app.constants';
import {
  APIHandleParams,
  FILTER_ACTION,
  INewsletterEmails,
} from '@src/pages/background/types/background.types';
import { getFilterId } from '../helper/getFilterId';
import { getLocalStorageByKey } from '@src/pages/background/utils/getStorageByKey';
import { addEmailToFilter } from '../helper/updateFilter';
import { logger } from '@src/pages/background/utils/logger';

// TODO: check if already whitelisted, if yes do nothing (update storage)

export const whitelistEmail = async ({ token, emails }: APIHandleParams) => {
  try {
    // get whitelist filter id
    const filterId = await getFilterId({ token, filterAction: FILTER_ACTION.INBOX });

    if (filterId) {
      // add email to filter
      addEmailToFilter({ token, emails, filterId, filterAction: FILTER_ACTION.INBOX });

      // get all the newsletter emails
      const newsletterEmails = await getLocalStorageByKey<INewsletterEmails[]>(storageKeys.NEWSLETTER_EMAILS);
      if (newsletterEmails && newsletterEmails.length > 0) {
        // check if these emails exists in the newsletters list (local.storage)
        const emailsPresentInNewsletterEmails = newsletterEmails?.filter(e => emails.includes(e.email));

        if (emailsPresentInNewsletterEmails.length > 0) {
          // if yes, remove the emails from newsletter list
          const updatedNewsletterEmails = newsletterEmails.filter(
            e => !emailsPresentInNewsletterEmails.includes(e)
          );
          // save updated newsletter emails
          await chrome.storage.local.set({ [storageKeys.NEWSLETTER_EMAILS]: updatedNewsletterEmails });
        }
      }
      return true;
    } else {
      throw new Error('❌ Failed to get whitelist filter');
    }
  } catch (error) {
    logger.error({
      error,
      msg: 'Error whitelisting email',
      fileTrace: 'background/services/api/gmail/handler/whitelistEmail.ts:40 ~ whitelistEmail() catch block',
    });
    return false;
  }
};
