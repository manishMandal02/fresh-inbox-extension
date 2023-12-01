import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import {
  FILTER_ACTION,
  IMessageBody,
  IMessageEvent,
  INewsletterEmails,
  ISession,
} from './types/background.types';
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
import { StorageKey, UserStorageKey, storageKeys } from './constants/app.constants';
import { getSessionStorageByKey } from './utils/getStorageByKey';
import { advanceSearch } from './services/api/gmail/handler/advance-search/advanceSearch';
import { bulkDelete } from './services/api/gmail/handler/advance-search/bulkDelete';
import { sendMsgToTab } from './utils/sendMsgToTab';
import { setStorage } from './utils/setStorage';
import { hasTokenExpired } from './utils/hasTokenExpired';
import { getFilterId } from './services/api/gmail/helper/getFilterId';

reloadOnUpdate('pages/background');

// Extension reloading is necessary because the browser automatically caches the css.
reloadOnUpdate('pages/content/style.scss');

logger.info('🏁 background script loaded');

// current session: email, token,tokenExpireAt
const currentSession: ISession = {
  email: '',
  token: '',
  expiresAt: '',
};

// google client id from env variables for google auth
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// generate storage key with user email, to differentiate data stored for multi email/users
export const generateStorageKey = (key: StorageKey): UserStorageKey => `${currentSession.email}-${key}`;

// initialize chrome storage on app install
const initializeStorage = async (userToken: string) => {
  try {
    const promises = [
      // sync storage
      // set app status
      setStorage({ type: 'sync', key: storageKeys.IS_APP_ENABLED, value: true }),
      // set preference: confirm delete action
      setStorage({ type: 'sync', key: storageKeys.DONT_SHOW_DELETE_CONFIRM_MSG, value: false }),

      //-- checks if app custom filter exists, if not create it (after successful auth)
      // unsubscribe filter
      getFilterId({ userToken, filterAction: FILTER_ACTION.TRASH }),
      // whitelist filter
      getFilterId({ userToken, filterAction: FILTER_ACTION.INBOX }),

      // local storage - get emails from filters and set to local storage
      // get/set unsubscribed emails
      getUnsubscribedEmails(userToken),

      // get/set whitelisted emails
      getWhitelistedEmails(userToken),

      // get/set newsletter emails
      getNewsletterEmails(userToken),
    ];

    // wait for all promises to resolve
    await Promise.allSettled(promises);

    logger.info(`✅ Successfully initialized chrome storage.`);

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

// store user session (email, token, ) in chrome session storage
const saveUserSession = async ({ token, email }: Pick<ISession, 'token' | 'email'>) => {
  // store session details
  currentSession.email = email;
  currentSession.token = token;

  const expireAt = new Date();

  // set token expiry time (it's valid for 60m)
  expireAt.setMinutes(expireAt.getMinutes() + 55);

  currentSession.expiresAt = expireAt.toString();

  // store session in chrome session storage
  await setStorage({ type: 'session', key: storageKeys.SESSIONS, value: currentSession });
};

// logout & clear user data
export const clearUserData = async (disableApp = false) => {
  await logoutUser(currentSession.token, disableApp);
  // remove session from chrome storage
  const userStorageKey = generateStorageKey(storageKeys.SESSIONS);
  await chrome.storage.session.remove(userStorageKey);

  // reset session variable
  currentSession.email = '';
  currentSession.token = '';
  currentSession.expiresAt = '';
};

// checks for user session and refreshes token if needed
const checkUserSession = async (event: IMessageEvent, userEmail: string) => {
  //
  logger.info(`Current Session: ${userEmail}`);

  // ignore events where tokens are not required
  if (event === IMessageEvent.CHECK_AUTH_TOKEN || event === IMessageEvent.LAUNCH_AUTH_FLOW) return;

  // check if the user whose session details are stored in currentSession variable is sending emails
  // and also check if the token is valid
  if (
    currentSession.email === userEmail &&
    currentSession.token &&
    !hasTokenExpired(currentSession.expiresAt)
  )
    return;

  const userStorageKey: UserStorageKey = `${userEmail}-${storageKeys.SESSIONS}`;

  // if not, get user session from chrome session storage
  const userSession = await getSessionStorageByKey(userStorageKey);

  // check if userSession exists & has not expired
  if (userSession && !hasTokenExpired(userSession.expiresAt)) {
    // userToken found in storage and is valid
    currentSession.token = userSession.token;
    currentSession.email = userSession.email;
    currentSession.expiresAt = userSession.expiresAt;
  } else {
    // userToken not found in storage or has expired

    // get new userToken
    const token = await getAuthToken(currentSession.email, googleClientId);

    if (token) {
      // save new token
      await saveUserSession({ token, email: currentSession.email });
    } else {
      // clear session data, revoke userToken, clear storage.
      await clearUserData(false);
      // logout user in the content script
      await sendMsgToTab({
        event: IMessageEvent.LOGOUT_USER,
      });
    }
  }
};

//SECTION listen for messages from content script
chrome.runtime.onMessage.addListener(
  asyncMessageHandler<IMessageBody, string | boolean | INewsletterEmails[] | string[]>(async request => {
    logger.info(`received event: ${request.event}`);

    // check for user session (authorization), refreshes token if needed before handling events
    await checkUserSession(request.event, request.userEmail);

    //  handle all the  events
    switch (request.event) {
      // check for user userToken
      case IMessageEvent.CHECK_AUTH_TOKEN: {
        const token = await getAuthToken(request.userEmail, googleClientId);

        if (token) {
          await saveUserSession({
            token,
            email: request.userEmail,
          });
          return true;
        } else {
          return false;
        }
      }

      // launch google auth
      case IMessageEvent.LAUNCH_AUTH_FLOW: {
        const token = await launchGoogleAuthFlow(request.userEmail, googleClientId);
        if (token) {
          // enable app  (after successful auth)
          await setStorage({ type: 'sync', key: storageKeys.IS_APP_ENABLED, value: true });
          // save user session
          await saveUserSession({
            token,
            email: request.userEmail,
          });
          return true;
        } else {
          return false;
        }
      }

      case IMessageEvent.CHECKS_AFTER_AUTH: {
        // check app (fresh inbox) custom filters
        return await initializeStorage(currentSession.token);
      }

      // unsubscribe email
      case IMessageEvent.UNSUBSCRIBE: {
        return await unsubscribeEmail({
          userToken: currentSession.token,
          emails: request.emails,
          isWhitelisted: request.isWhitelisted,
        });
      }

      // delete all mails
      case IMessageEvent.DELETE_ALL_MAILS: {
        return await deleteAllMails({ userToken: currentSession.token, emails: request.emails });
      }

      // unsubscribe and delete all mails
      case IMessageEvent.UNSUBSCRIBE_AND_DELETE_MAILS: {
        return await unsubscribeAndDeleteAllMails({
          userToken: currentSession.token,
          emails: request.emails,
          isWhitelisted: request.isWhitelisted,
        });
      }

      // get all newsletter emails
      case IMessageEvent.GET_NEWSLETTER_EMAILS: {
        const newsletterEmails = await getNewsletterEmails(currentSession.token);

        if (newsletterEmails) {
          return newsletterEmails;
        } else {
          return [];
        }
      }

      //  whitelist email
      case IMessageEvent.WHITELIST_EMAIL: {
        return await whitelistEmail({ userToken: currentSession.token, emails: request.emails });
      }

      //  re-subscribe
      case IMessageEvent.RE_SUBSCRIBE: {
        return await resubscribeEmail({ userToken: currentSession.token, emails: request.emails });
      }

      //  check for newsletter emails on page
      case IMessageEvent.GET_NEWSLETTER_EMAILS_ON_PAGE: {
        return await getNewsletterEmailsOnPage({
          userToken: currentSession.token,
          dataOnPage: request.dataOnPage,
        });
      }

      // get unsubscribed emails
      case IMessageEvent.GET_UNSUBSCRIBED_EMAILS: {
        return await getUnsubscribedEmails(currentSession.token);
      }

      //  get whitelisted emails
      case IMessageEvent.GET_WHITELISTED_EMAILS: {
        return await getWhitelistedEmails(currentSession.token);
      }

      // advance search: search number of emails that match the filters
      case IMessageEvent.ADVANCE_SEARCH: {
        return await advanceSearch(currentSession.token, request.advanceSearch);
      }

      // advance search: bulk delete emails
      case IMessageEvent.BULK_DELETE: {
        return await bulkDelete(currentSession.token, request.emails);
      }

      // disable app
      case IMessageEvent.DISABLE_FRESH_INBOX: {
        // clear user data, revoke userToken, clear storage.
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
