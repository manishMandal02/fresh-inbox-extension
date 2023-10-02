import { embedAssistantBtn } from './view/assistantButton';
import { IHoverCardElements } from './view/assistantButton/hoverCard/assistantHoverCard';
import { renderAuthModal } from './view/authModal';
import { IMessageBody, IMessageEvent } from './content.types';
import { asyncMessageHandler } from './utils/asyncMessageHandler';
import { refreshEmailsTable } from './utils/refreshEmailsTable';
import { mailMagicSettingsBtn } from './view/mailMagicSettingsBtn';

// content script global variables type
export interface MailMagicGlobalVariables {
  assistantBtnContainerId: string;
  isMouseOverHoverCard: boolean;
  isMouseOverMailMagicAssistantBtn: boolean;
}

// set  global variable state
window.mailMagicGlobalVariables = {
  assistantBtnContainerId: '',
  isMouseOverHoverCard: false,
  isMouseOverMailMagicAssistantBtn: false,
};

// run app
const startApp = async () => {
  // check for auth token (user access)
  const isTokenValid = await chrome.runtime.sendMessage({ event: IMessageEvent.Check_Auth_Token });

  console.log('🚀 ~ file: index.ts:125 ~ setTimeout ~ isTokenValid:', isTokenValid);
  // render mail magic status button (top button)
  mailMagicSettingsBtn();
  if (!isTokenValid) {
    // show auth modal to allow users to give access to gmail

    renderAuthModal({ embedAssistantBtn });
  } else {
    embedAssistantBtn();
  }
};

// TODO: a global error handler to catch any errors, (also add the chrome runtime error method)

//TODO: check if emails were loaded
// if-not: then wait for 500ms then check again (keep repeating)
// if-yes: then show the unsubscribe button

chrome.runtime.onMessage.addListener(
  asyncMessageHandler<IMessageBody, string | boolean>(async (request, sender) => {
    console.log(
      '🚀 ~ file: index.ts:130 ~ asyncMessageHandler<IMessageBody,string|boolean> ~ request:',
      request
    );

    switch (request.event) {
      case IMessageEvent.REFRESH_TABLE: {
        const isRefreshed = await refreshEmailsTable();

        console.log(
          '🚀 ~ file: index.ts:142 ~ asyncMessageHandler<IMessageBody,string|boolean> ~ isRefreshed:',
          isRefreshed
        );

        return isRefreshed;
      }
      default: {
        return 'Unknown Event';
      }
    }
  })
);

//TODO: Embed the settings button on all the url as the content script is only allowed on gmail's web app

//TODO: Embed/re-Embed assistant button when on inbox url: https://mail.google.com/mail/u/0/#inbox (get id from url, ex:inbox)
//urls to run on with ids: #inbox, #starred, #all, #spam
//TODO: and also when they see a email and come back to the email table

//TODO: check the chrome-sync-storage if app is enabled or not, better to do this in the background script on the very first call

// TODO: create a utility logger for both content & background scripts

// execute this script after 2.5s
setTimeout(() => {
  (async () => {
    // check if mail magic is enabled or not
    // const isEnabled = await chrome.storage.sync.get('isMailMagicEnabled');
    // run the app
    await startApp();
  })();
}, 2500);
