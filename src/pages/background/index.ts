import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import wait from './utils/wait';
import { IMessageBody, IMessageEvent } from './background.types';
import { asyncMessageHandler } from './utils/asyncMessageHandler';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('🔥 background loaded');

//TODO: Get current user info

// TODO: Check if we have user token

// TODO: if not: then show a modal with a btn to launch auth flow

// (async () => {
// getAutToken();
// })();

// listen for messages from content script - email action events
chrome.runtime.onMessage.addListener(
  asyncMessageHandler<IMessageBody>(async (request, sender) => {
    switch (request.event) {
      case IMessageEvent.Unsubscribe: {
        console.log('Received unsubscribe request for:', request.email);
        await wait(3000);
        return 'Unsubscribe Message received';
      }
      case IMessageEvent.DeleteAllMails: {
        console.log('Received deleteAllMails request for:', request.email);
        //   await wait(1000);
        return 'DeleteAllMails Message received';
      }
      case IMessageEvent.UnsubscribeAndDeleteAllMails: {
        console.log('Received unsubscribeAndDeleteAllMails request for:', request.email);
        //   await wait(1000);
        return 'UnsubscribeAndDeleteAllMails Message received';
      }
      default: {
        console.log('Received unknown message:', request);
        return 'Unknown event';
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
