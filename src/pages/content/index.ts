import { embedAssistantBtn } from './view/assistantButton';
import { renderAuthModal } from './view/authModal';
import { IMessageEvent } from './content.types';

import { mailMagicSettingsBtn } from './view/mailMagicSettingsBtn';
import { asyncHandler } from './utils/asyncHandler';
import { logger } from './utils/logger';

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

// execute this script after 2.5s
setTimeout(
  asyncHandler(async () => {
    await startApp();
  }),
  // check if mail magic is enabled or not
  // const isEnabled = await chrome.storage.sync.get('isMailMagicEnabled');
  // run the app
  1000
);

//TODO: wait 1s

//TODO: check if Mail Magic is enabled or not?, if not then show nothing (the setting btn can represent status icon/color)

//TODO: wait 2s

//TODO: check if the Gmail web app is loaded fully, (check for logo or some important btn) with retry mechanism

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
  mailMagicSettingsBtn();
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
