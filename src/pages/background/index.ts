import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import wait from './utils/wait';
import { IMessageBody, IMessageEvent, IUserInfo } from './background.types';
import { asyncMessageHandler } from './utils/asyncMessageHandler';
import { USER_ACCESS_DENIED, getAuthToken, getUserInfo, launchGoogleAuthFlow } from './auth';
import { deleteAllMails } from './api/gmailAPI';

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

//TODO: Get current user info

// TODO: Check if we have user token

// if (res.error === USER_ACCESS_DENIED) {
//   //TODO: user didn't complete the auth flow or denied access
// }

const isAuthTokenValid = async () => {
  try {
    userInfo = await getUserInfo();
    if (userInfo.userId) {
      const res = await getAuthToken(userInfo.userId);

      console.log('🚀 ~ file: index.ts:35 ~ isAuthTokenValid ~ res:', res);

      if (res.token) {
        token = res.token;
        return true;
      } else {
        return false;
      }
    }
  } catch (err) {
    console.log('🚀 ~ file: index.ts:42 ~ failed to auth: err:', err);
    return false;
  }
};

// listen for messages from content script - email action events
chrome.runtime.onMessage.addListener(
  asyncMessageHandler<IMessageBody, string | boolean>(async (request, sender) => {
    switch (request.event) {
      case IMessageEvent.Check_Auth_Token: {
        return isAuthTokenValid();
      }
      case IMessageEvent.Launch_Auth_Flow: {
        const res = await launchGoogleAuthFlow(userInfo.userId);
        if (res.token) {
          token = res.token;
          // send start app event
          await chrome.runtime.sendMessage({ event: IMessageEvent.Run_Mail_Magic });
          return true;
        } else {
          return false;
        }
      }
      case IMessageEvent.Unsubscribe: {
        console.log('Received unsubscribe request for:', request.email);
        await wait(3000);
        return 'Unsubscribe Message received.';
      }
      case IMessageEvent.Delete_All_Mails: {
        console.log('Received deleteAllMails request for:', request.email);
        await deleteAllMails(request.email, token);
        return 'DeleteAllMails Message received.';
      }
      case IMessageEvent.Unsubscribe_And_Delete_All_Mails: {
        console.log('Received unsubscribeAndDeleteAllMails request for:', request.email);
        //   await wait(1000);
        return 'UnsubscribeAndDeleteAllMails Message received.';
      }
      case IMessageEvent.Disable_MailMagic: {
        //TODO: disable mail magic
        try {
          await chrome.identity.clearAllCachedAuthTokens();
        } catch (err) {
          console.log('❌ Failed to disable Mail Magic, err:', err);
        }
        return '';
      }
      default: {
        console.log('Received unknown message:', request);
        return 'Unknown event.';
      }
    }
  })
);

// check for dev/prod env

// chrome.management.get(chrome.runtime.id, function (extensionInfo) {
//     if (extensionInfo.installType === 'development') {
//       // perform dev mode action here
//     }
// });
