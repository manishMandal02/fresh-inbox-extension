import { embedAssistantBtn } from './view/assistantButton';
import { renderAuthModal } from './view/authModal';
import { IMessageEvent } from './types/content.types';

import wait from './utils/wait';
import { getEmailIdFromPage } from './utils/getEmailIdFromPage';
import { getSyncStorageByKey } from './utils/getStorageByKey';
import { embedFreshInboxSettingsBtn } from './view/freshInboxSettingsBtn';

// content script global variables type
export interface FreshInboxGlobalVariables {
  assistantBtnContainerId: string;
  isMouseOverHoverCard: boolean;
  userEmail: string;
  isMouseOverFreshInboxAssistantBtn: boolean;
  loggerLevel: 'dev' | 'prod';
  isAppEnabled?: boolean;
}

// set  global variable state
window.freshInboxGlobalVariables = {
  assistantBtnContainerId: '',
  isMouseOverHoverCard: false,
  isMouseOverFreshInboxAssistantBtn: false,
  userEmail: '',
  //TODO: change it back to prod during deployment
  loggerLevel: 'dev',
};

// 🏁 main fn (starting point)
(async () => {
  // wait 2s
  await wait(2000);

  // query for user email id on page
  freshInboxGlobalVariables.userEmail = await getEmailIdFromPage();

  // check if app is enabled or not
  const appStatus = await getSyncStorageByKey<boolean>('IS_APP_ENABLED');

  freshInboxGlobalVariables.isAppEnabled = appStatus;

  if (!appStatus) {
    // App is disabled, embed setting btn with disabled state
    embedFreshInboxSettingsBtn({ isDisabled: true });
    return;
  }

  embedFreshInboxSettingsBtn({ isDisabled: false });

  // get client id from evn variables
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // is user Authed or not? (handle multiple user) send email id from the content script
  const isTokenValid = await chrome.runtime.sendMessage({
    clientId,
    event: IMessageEvent.CHECK_AUTH_TOKEN,
    email: freshInboxGlobalVariables.userEmail,
  });

  if (!isTokenValid) {
    // Auth token is not present
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
