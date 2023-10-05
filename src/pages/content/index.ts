import { embedAssistantBtn } from './view/assistantButton';
import { renderAuthModal } from './view/authModal';
import { IMessageEvent } from './types/content.types';

import wait from './utils/wait';
import { getEmailIdFromPage } from './utils/getEmailIdFromPage';
import { getSyncStorageByKey } from './utils/getStorageByKey';
import { embedMailMagicSettingsBtn } from './view/mailMagicSettingsBtn';

// content script global variables type
export interface MailMagicGlobalVariables {
  assistantBtnContainerId: string;
  isMouseOverHoverCard: boolean;
  isMouseOverMailMagicAssistantBtn: boolean;
  loggerLevel: 'dev' | 'prod';
}

// set  global variable state
window.mailMagicGlobalVariables = {
  assistantBtnContainerId: '',
  isMouseOverHoverCard: false,
  isMouseOverMailMagicAssistantBtn: false,
  //TODO: change it back to prod during deployment
  loggerLevel: 'dev',
};

//🔥 User flow

let userEmailId = null;

// 🏁 main fn (starting point)
(async () => {
  // wait 2s
  await wait(2000);
  // query for user email id on page
  userEmailId = await getEmailIdFromPage();

  // check if Mail Magic is enabled or not
  const appStatus = await getSyncStorageByKey<boolean>('IS_APP_ENABLED');

  console.log('🚀 ~ file: index.ts:43 ~ appStatus:', appStatus);

  if (!appStatus) {
    //wait for 1s
    await wait(1000);
    //TODO: if not then show nothing (the setting btn can represent status icon/color)
    embedMailMagicSettingsBtn();
    return;
  }

  // TODO: update auth flow to handle multiple users

  // is user Authed or not? (handle multiple user) send email id from the content script
  const isTokenValid = await chrome.runtime.sendMessage({ event: IMessageEvent.Check_Auth_Token });

  if (!isTokenValid) {
    // if auth token is not present
    // show auth modal to allow users to give app access to gmail service
    renderAuthModal();
  } else {
    //embed assistant button
    await embedAssistantBtn();
  }
})();

// save multiple auth token associated with the user based on the email id
// Mark the user as logged in during the isAuth check (this user details including token will be used for api, etc.)

// 🔥 re run app on web app changes (url or email table)
//TODO: Embed/re-Embed assistant button when on inbox url: https://mail.google.com/mail/u/0/#inbox (get id from url, ex:inbox)
//urls to run on with ids: #inbox, #starred, #all, #spam
//TODO: and also when they see a email and come back to the email table

// 🔥 global utilities

// TODO: add the chrome runtime error method, that can handler unhandled errors
