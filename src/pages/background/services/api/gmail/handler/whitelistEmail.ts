import { storageKeys } from '@src/pages/background/constants/app.constants';
import { FILTER_ACTION, NewsletterEmails } from '@src/pages/background/types/background.types';
import { getFilterId } from '../helper/getFilterId';
import { getLocalStorageByKey } from '@src/pages/background/utils/getStorageByKey';
import { addEmailToFilter } from '../helper/updateFilter';
import { logger } from '@src/pages/background/utils/logger';

// TODO: check if already whitelisted, if yes do nothing (update storage)
//
export const whitelistEmail = async (token: string, email: string) => {
  try {
    // get whitelist filter id
    const filterId = await getFilterId({ token, filterAction: FILTER_ACTION.INBOX });
    if (filterId) {
      // add email to filter
      addEmailToFilter({ token, email, filterId, filterAction: FILTER_ACTION.INBOX });

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
