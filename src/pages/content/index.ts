import { embedAssistantBtn, embedSingleAssistantBtn } from './view/assistantButton';
import { renderAuthModal } from './view/authModal';
import { IMessageEvent } from './types/content.types';

import wait from './utils/wait';
import { getEmailIdFromPage } from './utils/getEmailIdFromPage';
import { getSyncStorageByKey } from './utils/getStorageByKey';
import { embedFreshInboxSettingsBtn } from './view/freshInboxSettingsBtn';
import { onURLChange } from './utils/onURLChange';
import { asyncHandler } from './utils/asyncHandler';
import { logger } from './utils/logger';

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
  // change it back to prod during deployment
  loggerLevel: 'dev',
};

// top most container for inbox and also the single email container
const getTopMostTableContainer = () => {
  const containerXPath = '/html/body/div[7]/div[3]/div/div[2]/div[2]/div/div/div';
  return document.evaluate(
    containerXPath,
    // Context node
    document,
    // Namespace resolver
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
};

// watch for main container click (if a single is opened or navigated to diff categories)
// re-embed assistant button based on the container (weather it is an inbox or a single email)
const reEmbedAssistantBtnOnContainerClick = () => {
  const emailsContainer = getTopMostTableContainer();

  emailsContainer.addEventListener(
    'click',
    asyncHandler(async () => {
      await wait(500);

      const assistantBtn = document.getElementsByClassName('freshInbox-assistantBtn');

      // check if assistant button is already present
      // if present, do nothing
      if (assistantBtn && assistantBtn.length > 0 && !![...assistantBtn].find(btn => btn.checkVisibility()))
        return;

      // assistant button not found
      // embed assistant
      embedAssistantBtn(true);
    })
  );
};

// 🏁 main fn (starting point)
(async () => {
  // wait 2s
  await wait(2000);

  // query for user email id on page
  freshInboxGlobalVariables.userEmail = await getEmailIdFromPage();

  //TODO: confirm modal don't show again checkbox
  // showConfirmModal({
  //   msg: 'Are you sure your want to delete all mails',
  //   email: 'flipkart-newsletter@flipkar.com',
  //   onConfirmClick: async () => {},
  // });

  // check if app is enabled or not
  const appStatus = await getSyncStorageByKey<boolean>('IS_APP_ENABLED');

  freshInboxGlobalVariables.isAppEnabled = appStatus;

  if (!appStatus) {
    // App is disabled, embed setting btn with disabled state
    embedFreshInboxSettingsBtn({ isDisabled: true });
    return;
  }

  // app enabled
  // embed setting button
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
    // embed assistant button

    await embedAssistantBtn();

    // watch url change:  re-embed assistant button on url changes (if url supported)
    onURLChange(async () => {
      console.log('🚀 ~ file: index.ts:122 ~ onURLChange ~ onURLChange:');

      await embedAssistantBtn(true);
    });

    // watch for container/page change:
    // so that we can know if it's a inbox or a single emailed opened and embed assistant button accordingly
    reEmbedAssistantBtnOnContainerClick();
  }
})();

// TODO: check all email actions from all 3 places (table, single email, modal)

// TODO: complete all the necessary TODO comments
