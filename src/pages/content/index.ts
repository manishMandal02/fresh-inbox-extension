import { embedAssistantBtn } from './view/assistantButton';
import { renderAuthModal } from './view/authModal';
import { IMessageEvent } from './types/content.types';

import { asyncHandler } from './utils/asyncHandler';
import { logger } from './utils/logger';
import wait from './utils/wait';
import { getEmailIdFromPage } from './utils/getEmailIdFromPage';
import { getSyncStorageByKey } from './utils/getStorageByKey';
import { mailMagicSettingsBtn } from './view/mailMagicSettingsBtn';

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

// main fn (starting point)
(async () => {
  // wait 2s
  await wait(2000);
  // query for user email id on page
  userEmailId = await getEmailIdFromPage();

  console.log('🚀 ~ file: index.ts:51 ~ userEmailId:', userEmailId);

  //TODO: check if Mail Magic is enabled or not
  const appStatus = await getSyncStorageByKey<boolean>('IS_APP_ENABLED');
  if (!appStatus) {
    //wait for 1s
    await wait(1000);
    //TODO: if not then show nothing (the setting btn can represent status icon/color)
    mailMagicSettingsBtn();
    return;
  }
  // wait 2s
  await wait(2000);

  // check if the Gmail web app is loaded fully, (check for logo or some important btn) with retry mechanism
})();

//TODO: Is user Authed or not? (handle multiple user) send email id from the content script
// save multiple auth token associated with the user based on the email id
// Mark the user as logged in during the isAuth check (this user details including token will be used for api, etc.)

//TODO: if auth token is not present and app is not disabled show auth modal

//TODO:  Embed Assistant Button (with retry mechanism)

//TODO:  Embed Assistant Button (with retry mechanism)

// run app
const startApp = async () => {
  // check for auth token (user access)
  const isTokenValid = await chrome.runtime.sendMessage({ event: IMessageEvent.Check_Auth_Token });

  logger.dev(`Is auth token present: ${isTokenValid}`, `contend/index.ts:60 ~ startApp()`);

  // render mail magic status button (top button)
  if (!isTokenValid) {
    // show auth modal to allow users to give access to gmail

    renderAuthModal({
      embedAssistantBtn: async () => {
        await embedAssistantBtn();
      },
    });
  } else {
    embedAssistantBtn();
  }
};

// 🔥 re run app on web app changes (url or email table)

//TODO: Embed/re-Embed assistant button when on inbox url: https://mail.google.com/mail/u/0/#inbox (get id from url, ex:inbox)
//urls to run on with ids: #inbox, #starred, #all, #spam
//TODO: and also when they see a email and come back to the email table

// 🔥 global utilities

// TODO: create a utility logger for background scripts

// TODO: a global error handler to catch any errors, (also add the chrome runtime error method)
