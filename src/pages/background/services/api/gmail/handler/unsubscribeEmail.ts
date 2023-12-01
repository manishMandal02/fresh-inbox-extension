import { storageKeys } from '@src/pages/background/constants/app.constants';
import {
  APIHandleParams,
  FILTER_ACTION,
  INewsletterEmails,
} from '@src/pages/background/types/background.types';
import { getLocalStorageByKey } from '@src/pages/background/utils/getStorageByKey';
import { getFilterId } from '../helper/getFilterId';
import { getWhitelistedEmails } from './getWhitelistedEmails';
import { addEmailToFilter, removeEmailFromFilter } from '../helper/updateFilter';
import { logger } from '@src/pages/background/utils/logger';
import { setStorage } from '@src/pages/background/utils/setStorage';

type UnsubscribeEmailParams = {
  isWhitelisted: boolean;
} & APIHandleParams;

// handle unsubscribe/block email
export const unsubscribeEmail = async ({ userToken, emails, isWhitelisted }: UnsubscribeEmailParams) => {
  try {
    // check if fresh-Inbox filter id exists in storage
    const filterId = await getFilterId({ userToken, filterAction: FILTER_ACTION.TRASH });

    if (!filterId) throw new Error('❌ Failed to get unsubscribe filter id');

    // block/unsubscribe email
    // update filter: add email to filter
    await addEmailToFilter({ userToken, filterId, emails, filterAction: FILTER_ACTION.TRASH });

    // get all the newsletter emails
    const newsletterEmails = await getLocalStorageByKey<INewsletterEmails[]>(storageKeys.NEWSLETTER_EMAILS);
    if (newsletterEmails && newsletterEmails.length > 0) {
      // remove the unsubscribed emails if present in newsletter emails
      const filteredNewsletterEmails = newsletterEmails?.filter(e => !emails.includes(e.email));

      // check if the original newsletter emails and filtered newsletter emails
      if (filteredNewsletterEmails.length !== newsletterEmails.length) {
        // if not same, some newsletter emails were unsubscribed

        // save updated newsletter emails
        await setStorage({
          type: 'local',
          key: storageKeys.NEWSLETTER_EMAILS,
          value: filteredNewsletterEmails,
        });
      }
    }

    // check isWhitelisted flag:
    // if present, remove the emails from the whitelist filter as well
    if (isWhitelisted) {
      const whitelistedEmails = await getWhitelistedEmails(userToken);

      if (!whitelistedEmails) return true;

      if (whitelistedEmails.filter(e => emails.includes(e)).length > 0) {
        // get whitelist filter id
        const whitelistFilterId = await getFilterId({ userToken, filterAction: FILTER_ACTION.INBOX });
        // remove email from whitelist filter
        await removeEmailFromFilter({
          userToken,
          emails,
          filterId: whitelistFilterId,
          filterAction: FILTER_ACTION.INBOX,
        });
      }
    }

    return true;
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
