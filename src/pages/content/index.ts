import { embedAssistantBtn, embedSingleAssistantBtn } from './view/assistantButton';
import { renderAuthModal } from './view/authModal';
import { IMessageEvent } from './types/content.types';

import wait from './utils/wait';
import { getEmailIdFromPage } from './utils/getEmailIdFromPage';
import { getSyncStorageByKey } from './utils/getStorageByKey';
import { embedFreshInboxSettingsBtn } from './view/freshInboxSettingsBtn';
import { onURLChange } from './utils/onURLChange';
import { asyncHandler } from './utils/asyncHandler';
import { MAIL_NODES_SELECTOR } from './constants/app.constants';
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
    document, // Context node
    null, // Namespace resolver
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
};

// checks if the current url is supported (inbox, starred, all, spam)
const isSupportedURL = () => {
  // get anchor id form the url

  const anchorId = location.href.split('#')?.pop();

  // labels/pages to embed the assistant button on
  const supportedLabels = ['inbox', 'starred', 'all', 'spam'];

  // check if anchor id is present and it is one of the supported labels
  if (anchorId && supportedLabels.includes(anchorId)) {
    // supported url
    return true;
  }
  // not supported url
  return false;
};

// watch for url change
// re-embed assistant button if the changed url is supported
const reEmbedAssistantBtnOnURLChange = () => {
  // watch for url change
  onURLChange(async () => {
    // check if the url is supported (inbox, starred, all, spam)
    if (isSupportedURL()) {
      // this is a supported url
      // re-embed the assistant button
      await embedAssistantBtn(true);
    }
  });
};

// get the opened container type (inbox or single email)
const getOpenedContainerType = (): 'inbox' | 'singleEmail' => {
  // checking for single email container
  // check if it has a print mail button
  const printEmailBtn = document.querySelector('button[aria-label="Print all"]');

  if (printEmailBtn) {
    return 'singleEmail';
  }

  // checking for inbox inbox
  // check for row with sender email
  const emailRow = document.querySelector(MAIL_NODES_SELECTOR);

  if (emailRow) {
    return 'inbox';
  }

  return null;
};

// watch for main container click (if a single is opened or navigated to diff categories)
// re-embed assistant button based on the container (weather it is an inbox or a single email)
const reEmbedAssistantBtnOnContainerClick = () => {
  const emailsContainer = getTopMostTableContainer();

  emailsContainer.addEventListener(
    'click',
    asyncHandler(async () => {
      // 1. check if assistant button is already added

      await wait(500);

      const assistantBtn = document.getElementsByClassName('freshInbox-assistantBtn');

      // assistant button present, do nothing
      if (assistantBtn && assistantBtn.length > 0 && !![...assistantBtn].find(btn => btn.checkVisibility()))
        return;

      //  check if it is an inbox container or a single email container

      const containerType = getOpenedContainerType();

      if (!containerType) {
        // not a supported container type
        logger.info('Not supported container type');
        return;
      }

      if (containerType === 'singleEmail') {
        // this is a single email container

        // embed the assistant button
        embedSingleAssistantBtn();

        return;
      }

      if (containerType === 'inbox') {
        // this is inbox

        // embed assistant buttons on newsletter emails
        embedAssistantBtn(true);
      }
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
    // check current url is a supported url
    if (isSupportedURL()) {
      console.log('🚀 ~ file: index.ts:194 ~ isSupportedURL:', isSupportedURL());

      // check for container type & embed assistant button accordingly
      const containerType = getOpenedContainerType();

      console.log('🚀 ~ file: index.ts:198 ~ containerType:', containerType);

      if (containerType === 'inbox') {
        //embed multiple assistant buttons on newsletter emails
        await embedAssistantBtn();
      } else if (containerType === 'singleEmail') {
        // embed single assistant button
        embedSingleAssistantBtn();
      }
    }

    // re-embed assistant button on url changes
    reEmbedAssistantBtnOnURLChange();

    // watch for changes to inbox container
    // so that we can know if it's a inbox or a single emailed opened and embed assistant button accordingly
    reEmbedAssistantBtnOnContainerClick();
  }
})();

// TODO: check all email actions from all 3 places (table, single email, modal)

// TODO: complete all the necessary TODO comments
