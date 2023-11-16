import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import { FILTER_ACTION, IMessageBody, IMessageEvent, NewsletterEmails } from './types/background.types';
import { asyncMessageHandler } from './utils/asyncMessageHandler';
import { logoutUser, getAuthToken, launchGoogleAuthFlow } from './services/auth';
import {
  deleteAllMails,
  getNewsletterEmails,
  unsubscribeAndDeleteAllMails,
  unsubscribeEmail,
} from './services/api/gmail/handler';
import { getUnsubscribedEmails } from './services/api/gmail/handler/getUnsubscribedEmails';
import { getWhitelistedEmails } from './services/api/gmail/handler/getWhitelistedEmails';
import { whitelistEmail } from './services/api/gmail/handler/whitelistEmail';
import { resubscribeEmail } from './services/api/gmail/handler/resubscribeEmail';
import { getNewsletterEmailsOnPage } from './services/api/gmail/handler/getNewsletterEmailsOnPage';
import { logger } from './utils/logger';
import { storageKeys } from './constants/app.constants';
import { getFilterId } from './services/api/gmail/helper/getFilterId';
import { getSyncStorageByKey } from './utils/getStorageByKey';
import { advanceSearch } from './services/api/gmail/handler/advance-search/advanceSearch';
import { bulkDelete } from './services/api/gmail/handler/advance-search/bulkDelete';

reloadOnUpdate('pages/background');

// Extension reloading is necessary because the browser automatically caches the css.
reloadOnUpdate('pages/content/style.scss');

logger.info('🏁 background script loaded');

// TODO: fix: sometimes the token is empty (usually after staying sometime on the tab)
// background service global variable
let token = '';

console.log('🚀 ~ file: index.ts:34 ~ token:', token);

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

// check if app custom filter exists, if not create it
const checkFreshInboxFilters = async () => {
  try {
    const promises = [
      // unsubscribe filter
      getFilterId({ token, filterAction: FILTER_ACTION.TRASH }),
      // whitelist filter
      getFilterId({ token, filterAction: FILTER_ACTION.INBOX }),
    ];

    // wait for all promises to resolve
    // throw error if any of the promises reject to catch in the catch block
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

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// extension install event listener
chrome.runtime.onInstalled.addListener(({ reason }) => {
  (async () => {
    if (reason === 'install') {
      await initializeStorage();
    }
  })();
});

// listen for messages from content script - email action events
chrome.runtime.onMessage.addListener(
  asyncMessageHandler<IMessageBody, string | boolean | NewsletterEmails[] | string[]>(async request => {
    logger.info(`received event: ${request.event}`);
    // switch case
    switch (request.event) {
      // check for user token
      case IMessageEvent.CHECK_AUTH_TOKEN: {
        const res = await getAuthToken(request.userEmail, googleClientId);

        if (res) {
          token = res;
          return true;
        } else {
          return false;
        }
      }

      // launch google auth
      case IMessageEvent.LAUNCH_AUTH_FLOW: {
        const res = await launchGoogleAuthFlow(request.userEmail, googleClientId);

        if (res) {
          token = res;
          return true;
        } else {
          return false;
        }
      }

      case IMessageEvent.CHECKS_AFTER_AUTH: {
        // enable app if disabled (after successful auth)
        const isAppEnabled = await getSyncStorageByKey<boolean>('IS_APP_ENABLED');
        if (!isAppEnabled) {
          // enable app
          await chrome.storage.sync.set({ [storageKeys.IS_APP_ENABLED]: true });
        }

        // check app (fresh inbox) custom filters
        return await checkFreshInboxFilters();
      }

      // unsubscribe email
      case IMessageEvent.UNSUBSCRIBE: {
        return await unsubscribeEmail({
          token,
          emails: request.emails,
          isWhitelisted: request.isWhitelisted,
        });
      }

      // delete all mails
      case IMessageEvent.DELETE_ALL_MAILS: {
        return await deleteAllMails({ token, emails: request.emails });
      }

      // unsubscribe and delete all mails
      case IMessageEvent.UNSUBSCRIBE_AND_DELETE_MAILS: {
        return await unsubscribeAndDeleteAllMails({
          token,
          emails: request.emails,
          isWhitelisted: request.isWhitelisted,
        });
      }

      // get all newsletter emails
      case IMessageEvent.GET_NEWSLETTER_EMAILS: {
        const newsletterEmails = await getNewsletterEmails(token);

        if (newsletterEmails) {
          return newsletterEmails;
        } else {
          return [];
        }
      }

      //  whitelist email
      case IMessageEvent.WHITELIST_EMAIL: {
        return await whitelistEmail({ token, emails: request.emails });
      }

      //  re-subscribe
      case IMessageEvent.RE_SUBSCRIBE: {
        return await resubscribeEmail({ token, emails: request.emails });
      }

      //  check for newsletter emails on page
      case IMessageEvent.GET_NEWSLETTER_EMAILS_ON_PAGE: {
        return await getNewsletterEmailsOnPage({ token, dataOnPage: request.dataOnPage });
      }

      // get unsubscribed emails
      case IMessageEvent.GET_UNSUBSCRIBED_EMAILS: {
        return await getUnsubscribedEmails(token);
      }

      //  get whitelisted emails
      case IMessageEvent.GET_WHITELISTED_EMAILS: {
        return await getWhitelistedEmails(token);
      }

      // advance search: search number of emails that match the filters
      case IMessageEvent.ADVANCE_SEARCH: {
        return await advanceSearch(token, request.advanceSearch);
      }

      // advance search: bulk delete emails
      case IMessageEvent.BULK_DELETE: {
        return await bulkDelete(token, request.emails);
      }

      // disable app
      case IMessageEvent.DISABLE_FRESH_INBOX: {
        return await logoutUser(token);
      }

      default: {
        logger.info(`Received unknown event in background script: ${request.event}`);
        return 'Unknown event.';
      }
    }
  })
);
