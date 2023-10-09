import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import {
  FILTER_ACTION,
  IMessageBody,
  IMessageEvent,
  IUserInfo,
  NewsletterEmails,
} from './types/background.types';
import { asyncMessageHandler } from './utils/asyncMessageHandler';
import { logoutUser, getAuthToken, getUserInfo, launchGoogleAuthFlow } from './services/auth';
import {
  deleteAllMails,
  getNewsletterEmails,
  unsubscribeAndDeleteAllMails,
  unsubscribeEmail,
} from './services/api/gmail/handler';
import { getUnsubscribedEmails } from './services/api/gmail/handler/getUnsubscribedEmails';
import { getWhitelistedEmails } from './services/api/gmail/handler/getWhitelistedEmails';
import { whitelistEmail } from './services/api/gmail/handler/whitelisteEmail';
import { resubscribeEmail } from './services/api/gmail/handler/resubscribeEmail';
import { getNewsletterEmailsOnPage } from './services/api/gmail/handler/getNewsletterEmailsOnPage';
import { logger } from './utils/logger';
import { storageKeys } from './constants/app.constants';
import { getFilterId } from './services/api/gmail/helper/getFilterId';
import { getSyncStorageByKey } from './utils/getStorageByKey';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

logger.info('🏁 background script loaded');

// background service global variable
let token = '';

const initializeStorage = async () => {
  try {
    const promises = [
      // sync storage
      // set app status
      chrome.storage.sync.set({ [storageKeys.IS_APP_ENABLED]: true }),
      // set unsubscribe filter id
      chrome.storage.sync.set({ [storageKeys.UNSUBSCRIBE_FILTER_ID]: '' }),
      // set whitelist filter id
      chrome.storage.sync.set({ [storageKeys.WHITELIST_FILTER_ID]: '' }),

      // local storage
      // set newsletter emails
      chrome.storage.local.set({ [storageKeys.NEWSLETTER_EMAILS]: [] }),
      // set unsubscribed emails
      chrome.storage.local.set({ [storageKeys.UNSUBSCRIBED_EMAILS]: [] }),
      // set whitelisted emails
      chrome.storage.local.set({ [storageKeys.WHITELISTED_EMAILS]: [] }),
    ];

    // wait for all promises to resolve
    // throw error if any of the promises reject to catch in the catch block
    await Promise.all(promises.map(promise => promise.catch(err => err)));
  } catch (error) {
    logger.error({
      error,
      msg: 'Failed to initialize storage',
      fileTrace: 'background/index.ts:37 ~ initializeStorage() - catch block',
    });
  }
};

// check if mail magic custom filter exists, if not create it
const checkMailMagicFilters = async () => {
  try {
    const promises = [
      // unsubscribe filter
      getFilterId({ token, filterAction: FILTER_ACTION.TRASH }),
      // whitelist filter
      getFilterId({ token, filterAction: FILTER_ACTION.INBOX }),
    ];
    await Promise.all(promises.map(promise => promise.catch(err => err)));
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

//TODO: on app install
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    await initializeStorage();
  }
});
// initialize sync storage items
// create a custom trash filter for mail-magic to add unsubscribed emails
// create whitelist filter as well

// listen for messages from content script - email action events
chrome.runtime.onMessage.addListener(
  asyncMessageHandler<IMessageBody, string | boolean | NewsletterEmails[] | string[]>(async request => {
    logger.info(`received event: ${request.event}`);
    // switch case
    switch (request.event) {
      case IMessageEvent.CHECK_AUTH_TOKEN: {
        const res = await getAuthToken(request.email);

        if (res) {
          token = res;
          return true;
        } else {
          return false;
        }
      }

      case IMessageEvent.LAUNCH_AUTH_FLOW: {
        const res = await launchGoogleAuthFlow(request.email);

        if (res) {
          token = res;
          return true;
        } else {
          return false;
        }
      }

      case IMessageEvent.CHECKS_AFTER_AUTH: {
        // enable mail magic if disabled (after successful auth)

        const isAppEnabled = await getSyncStorageByKey<boolean>('IS_APP_ENABLED');
        if (!isAppEnabled) {
          // enable app
          await chrome.storage.sync.set({ [storageKeys.IS_APP_ENABLED]: true });
        }

        // check mail magic custom filters
        const res = await checkMailMagicFilters();

        return res;
      }

      case IMessageEvent.UNSUBSCRIBE: {
        return await unsubscribeEmail({
          token,
          email: request.email,
          isWhiteListed: request.isWhiteListed,
        });
      }

      case IMessageEvent.DELETE_ALL_MAILS: {
        return await deleteAllMails({ token, email: request.email });
      }

      case IMessageEvent.UNSUBSCRIBE_AND_DELETE_MAILS: {
        return await unsubscribeAndDeleteAllMails({
          token,
          email: request.email,
          isWhiteListed: request.isWhiteListed,
        });
      }

      case IMessageEvent.GET_NEWSLETTER_EMAILS: {
        const newsletterEmails = await getNewsletterEmails(token);

        if (newsletterEmails.length > 0) {
          return newsletterEmails;
        } else {
          return [];
        }
      }

      // handle whitelist email
      case IMessageEvent.WHITELIST_EMAIL: {
        return await whitelistEmail(token, request.email);
      }

      // handle check for newsletter emails on page
      case IMessageEvent.GET_NEWSLETTER_EMAILS_ON_PAGE: {
        return await getNewsletterEmailsOnPage({ token, dataOnPage: request.dataOnPage });
      }

      case IMessageEvent.GET_UNSUBSCRIBED_EMAILS: {
        return await getUnsubscribedEmails(token);
      }

      // handle get whitelisted emails
      case IMessageEvent.GET_WHITELISTED_EMAILS: {
        return await getWhitelistedEmails(token);
      }

      // handle re-subscribe
      case IMessageEvent.RE_SUBSCRIBE: {
        return await resubscribeEmail(token, request.email);
      }

      case IMessageEvent.DISABLE_MAIL_MAGIC: {
        //TODO: disable mail magic
        // update storage accordingly, think...
        try {
          await logoutUser(token);

          return true;
        } catch (err) {}
        return false;
      }

      default: {
        logger.info(`Received unknown event in background script: ${request.event}`);
        return 'Unknown event.';
      }
    }
  })
);
