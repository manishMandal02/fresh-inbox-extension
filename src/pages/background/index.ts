import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import { IMessageBody, IMessageEvent, IUserInfo, NewsletterEmails } from './types/background.types';
import { asyncMessageHandler } from './utils/asyncMessageHandler';
import { clearToken, getAuthToken, getUserInfo, launchGoogleAuthFlow } from './services/auth';
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

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('🔥 background loaded');

// background service global variable
let userInfo: IUserInfo = null;
let token = '';
let activeTabId = 0;

const isAuthTokenValid = async () => {
  try {
    userInfo = await getUserInfo();
    if (userInfo.userId) {
      console.log('🚀 ~ file: index.ts:35 ~ isAuthTokenValid ~ userInfo:', userInfo);

      const res = await getAuthToken(userInfo.userId);

      console.log('🚀 ~ file: index.ts:35 ~ isAuthTokenValid ~ res:', res);

      if (res.token) {
        token = res.token;
        return true;
      } else {
        token = '';
        return false;
      }
    }
  } catch (err) {
    console.log('🚀 ~ file: index.ts:42 ~ failed to auth: err:', err);
    return false;
  }
};

// get current tab id
const setActiveTabId = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab.id) throw new Error('No active tab found');

    activeTabId = tab.id;
  } catch (err) {
    console.log('❌ ~ file: index.ts:64 ~ setActiveTabId ~ err:', err);
  }
};

//TODO: on app install
// initialize sync storage items
// create a custom trash filter for mail-magic to add unsubscribed emails
// create whitelist filter as well

//TODO: handle errors globally for each switch case at the handler level not in the (switch) case statement

// listen for messages from content script - email action events
chrome.runtime.onMessage.addListener(
  asyncMessageHandler<IMessageBody, string | boolean | NewsletterEmails[] | string[]>(
    async (request, sender) => {
      switch (request.event) {
        case IMessageEvent.Check_Auth_Token: {
          await setActiveTabId();
          return isAuthTokenValid();
        }

        case IMessageEvent.Launch_Auth_Flow: {
          const res = await launchGoogleAuthFlow(userInfo.userId);

          if (res.token) {
            token = res.token;
            return true;
          } else {
            return false;
          }
        }

        case IMessageEvent.Unsubscribe: {
          console.log('Received unsubscribe request for:', request.email);
          try {
            await unsubscribeEmail({ token, email: request.email, isWhiteListed: request.isWhiteListed });
            return true;
          } catch (err) {
            console.log(
              '🚀 ~ file: index.ts:104 ~ asyncMessageHandler<IMessageBody,string|boolean|NewsletterEmails[]> ~ err:',
              err
            );
            return false;
          }
        }

        case IMessageEvent.Delete_All_Mails: {
          console.log('Received deleteAllMails request for:', request.email);

          try {
            await deleteAllMails({ email: request.email, token });

            // refresh the the table
            await chrome.tabs.sendMessage(activeTabId, { event: IMessageEvent.REFRESH_TABLE });

            return true;
          } catch (err) {
            console.log(
              '🚀 ~ file: index.ts:100 ~ asyncMessageHandler<IMessageBody,string|boolean> ~ err:',
              err
            );
            return false;
          }
        }

        case IMessageEvent.Unsubscribe_And_Delete_All_Mails: {
          console.log('Received unsubscribeAndDeleteAllMails request for:', request.email);
          try {
            await unsubscribeAndDeleteAllMails({ email: request.email, token });
            return true;
          } catch (err) {
            console.log(
              '🚀 ~ file: index.ts:142 ~ asyncMessageHandler<IMessageBody,string|boolean|NewsletterEmails[]> ~ err:',
              err
            );
            return false;
          }
        }

        case IMessageEvent.GET_NEWSLETTER_EMAILS: {
          console.log('Received getNewsletterEmails request');

          try {
            const newsletterEmails = await getNewsletterEmails(token);

            console.log(
              '🚀 ~ file: index.ts:130 ~ asyncMessageHandler<IMessageBody,string|boolean|string[]> ~ newsletterEmails:',
              newsletterEmails
            );

            if (newsletterEmails.length > 0) {
              return newsletterEmails;
            } else {
              throw new Error('No newsletter emails found');
            }
          } catch (err) {
            console.log('Error getting newsletter emails', err);
            return [];
          }
        }

        // handle whitelist email
        case IMessageEvent.WHITELIST_EMAIL: {
          console.log('Received WHITELIST_EMAIL request for:', request.email);
          return await whitelistEmail(token, request.email);
        }

        // handle check for newsletter emails on page
        case IMessageEvent.GET_NEWSLETTER_EMAILS_ON_PAGE: {
          console.log('Received CHECK_NEWSLETTER_EMAILS_ON_PAGE request');
          const res = await getNewsletterEmailsOnPage({ token, dataOnPage: request.dataOnPage });
          return res;
        }

        case IMessageEvent.GET_UNSUBSCRIBED_EMAILS: {
          console.log('Received GET_UNSUBSCRIBED_EMAILS request');
          const unsubscribedEmails = await getUnsubscribedEmails(token);
          return unsubscribedEmails;
        }

        // handle get whitelisted emails
        case IMessageEvent.GET_WHITELISTED_EMAILS: {
          console.log('Received GET_WHITELISTED_EMAILS request');

          const whitelistedEmails = await getWhitelistedEmails(token);
          return whitelistedEmails;
        }

        // handle re-subscribe
        case IMessageEvent.RE_SUBSCRIBE: {
          console.log('Received RE_SUBSCRIBE request for ', request.email);
          const res = await resubscribeEmail(token, request.email);
          return res;
        }

        case IMessageEvent.Disable_MailMagic: {
          //TODO: disable mail magic
          try {
            await clearToken(token);

            return true;
          } catch (err) {
            console.log('❌ Failed to disable Mail Magic, err:', err);
          }
          return false;
        }

        default: {
          console.log('Received unknown message:', request);
          return 'Unknown event.';
        }
      }
    }
  )
);

// check for dev/prod env

// chrome.management.get(chrome.runtime.id, function (extensionInfo) {
//     if (extensionInfo.installType === 'development') {
//       // perform dev mode action here
//     }
// });
