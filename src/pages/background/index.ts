import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import { IMessageBody, IMessageEvent, IUserInfo, NewsletterEmails } from './types/background.types';
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

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

logger.info('🏁 background script loaded');

// background service global variable
let token = '';

// TODO: update auth flow to handle multiple users

//TODO: on app install
// initialize sync storage items
// create a custom trash filter for mail-magic to add unsubscribed emails
// create whitelist filter as well

// listen for messages from content script - email action events
chrome.runtime.onMessage.addListener(
  asyncMessageHandler<IMessageBody, string | boolean | NewsletterEmails[] | string[]>(async request => {
    logger.info(`received event: ${request.event}`);
    // switch case
    switch (request.event) {
      case IMessageEvent.Check_Auth_Token: {
        const res = await getAuthToken(request.email);

        console.log('🚀 ~ file: index.ts:47 ~ res:', res);

        if (res) {
          token = res;
          return true;
        } else {
          return false;
        }
      }

      case IMessageEvent.Launch_Auth_Flow: {
        const res = await launchGoogleAuthFlow(request.email);

        if (res) {
          token = res;
          return true;
        } else {
          return false;
        }
      }

      case IMessageEvent.Unsubscribe: {
        return await unsubscribeEmail({
          token,
          email: request.email,
          isWhiteListed: request.isWhiteListed,
        });
      }

      case IMessageEvent.Delete_All_Mails: {
        return await deleteAllMails({ token, email: request.email });
      }

      case IMessageEvent.Unsubscribe_And_Delete_All_Mails: {
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
