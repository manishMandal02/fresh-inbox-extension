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
import { setStorage } from '@src/pages/background/utils/setStorage';

export const whitelistEmail = async ({ userToken, emails }: APIHandleParams) => {
  try {
    // get whitelist filter id
    const filterId = await getFilterId({ userToken, filterAction: FILTER_ACTION.INBOX });

    if (!filterId) throw new Error('❌ Failed to get whitelist filter');
    // add email to filter
    addEmailToFilter({ userToken, emails, filterId, filterAction: FILTER_ACTION.INBOX });

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
    return true;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error whitelisting email',
      fileTrace: 'background/services/api/gmail/handler/whitelistEmail.ts:40 ~ whitelistEmail() catch block',
    });
    return false;
  }
};
