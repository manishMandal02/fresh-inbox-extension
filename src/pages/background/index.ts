import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import { IMessageBody, IMessageEvent, INewsletterEmails } from './types/background.types';
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
import { getSyncStorageByKey } from './utils/getStorageByKey';
import { advanceSearch } from './services/api/gmail/handler/advance-search/advanceSearch';
import { bulkDelete } from './services/api/gmail/handler/advance-search/bulkDelete';
import { checkFreshInboxFilters } from './services/api/gmail/helper/checkFreshInboxFilters';

reloadOnUpdate('pages/background');

// Extension reloading is necessary because the browser automatically caches the css.
reloadOnUpdate('pages/content/style.scss');

logger.info('🏁 background script loaded');

// TODO: fix: sometimes the token is empty (usually after staying sometime on the tab)
// user email & toke
let userEmail = '';
let token = '';

// initialize chrome storage on app install
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

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// store token in chrome session storage
const saveTokenToStorage = async (newToken: string, email: string) => {
  token = newToken;
  userEmail = email;
  await chrome.storage.session.set({ [storageKeys.SESSION_TOKEN]: { token: newToken, email } });
};

const checkToken = async (event: IMessageEvent) => {
  // ignore events where tokens are not required
  if (
    event === IMessageEvent.CHECKS_AFTER_AUTH ||
    event === IMessageEvent.CHECK_AUTH_TOKEN ||
    event === IMessageEvent.LAUNCH_AUTH_FLOW
  )
    return;

  // if token present, do nothing
  if (token) return;

  // get token from chrome session storage
  const tokenStorage = await chrome.storage.session.get(storageKeys.SESSION_TOKEN);
  if (tokenStorage && tokenStorage[storageKeys.SESSION_TOKEN].token) {
    // token found in storage
    token = tokenStorage[storageKeys.SESSION_TOKEN].token;
    userEmail = tokenStorage[storageKeys.SESSION_TOKEN].email;
  } else {
    // token not found in storage
    // get new token
    const res = await getAuthToken(userEmail, googleClientId);

    if (res) {
      await saveTokenToStorage(res, userEmail);
    } else {
      token = '';
      userEmail = '';
      //TODO: requires sign in, logout user
      //TODO: send events to content => logout user
      //TODO: create a re-usable event emitter for b=>c
    }
  }
};

// extension install event listener
chrome.runtime.onInstalled.addListener(({ reason }) => {
  (async () => {
    if (reason === 'install') {
      await initializeStorage();
      logger.info('✅ Successfully app initialized on install.');
    }
  })();
});

// logout & clear user data
const clearUserData = async () => {
  await logoutUser(token);
  token = '';
  userEmail = '';
  await chrome.storage.session.remove(storageKeys.SESSION_TOKEN);
};

//SECTION listen for messages from content script - email action events
chrome.runtime.onMessage.addListener(
  asyncMessageHandler<IMessageBody, string | boolean | INewsletterEmails[] | string[]>(async request => {
    logger.info(`received event: ${request.event}`);

    // check for token
    await checkToken(request.event);
    // switch case
    switch (request.event) {
      // check for user token
      case IMessageEvent.CHECK_AUTH_TOKEN: {
        const res = await getAuthToken(request.userEmail, googleClientId);

        if (res) {
          await saveTokenToStorage(res, request.userEmail);
          return true;
        } else {
          return false;
        }
      }

      // launch google auth
      case IMessageEvent.LAUNCH_AUTH_FLOW: {
        const res = await launchGoogleAuthFlow(request.userEmail, googleClientId);

        if (res) {
          await saveTokenToStorage(res, request.userEmail);
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
        return await checkFreshInboxFilters(token);
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
        // logout & clear user data
        await clearUserData();
        return true;
      }

      default: {
        logger.info(`Received unknown event in background script: ${request.event}`);
        return 'Unknown event.';
      }
    }
  })
);
