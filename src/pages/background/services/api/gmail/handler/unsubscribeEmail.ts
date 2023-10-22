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
  isWhitelisted: boolean;
} & APIHandleParams;

// TODO: check if already unsubscribed, if yes do nothing (update storage)

// handle unsubscribe/block email
export const unsubscribeEmail = async ({ token, emails, isWhitelisted }: UnsubscribeEmailParams) => {
  try {
    // check if fresh-Inbox filter id exists in storage
    const filterId = await getFilterId({ token, filterAction: FILTER_ACTION.TRASH });

    if (filterId) {
      // block/unsubscribe email
      // update filter: add email to filter
      await addEmailToFilter({ token, filterId, emails, filterAction: FILTER_ACTION.TRASH });

      // get all the newsletter emails
      const newsletterEmails = await getLocalStorageByKey<NewsletterEmails[]>(storageKeys.NEWSLETTER_EMAILS);
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

      // check the isWhitelisted flag: if present, remove the emails from the whitelist filter as well
      if (isWhitelisted) {
        const whitelistedEmails = await getWhitelistedEmails(token);

        if (!whitelistedEmails) return true;

        if (whitelistedEmails.filter(e => emails.includes(e)).length > 0) {
          // get whitelist filter id
          const whitelistFilterId = await getFilterId({ token, filterAction: FILTER_ACTION.INBOX });
          // remove email from whitelist filter
          await removeEmailFromFilter({
            token,
            filterId: whitelistFilterId,
            emails,
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
      msg: `Error unsubscribing from 👉 emails: ${emails}`,
      fileTrace:
        'background/services/api/gmail/handler/unsubscribeEmail.ts:69 ~ unsubscribeEmail() catch block',
    });
    return false;
  }
};
