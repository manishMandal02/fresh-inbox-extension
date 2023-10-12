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

// top most container for emails table and also the single email container
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

const listenForClicksOnContainer = () => {
  const emailsContainer = getTopMostTableContainer();

  console.log('🚀 ~ file: index.ts:48 ~ listenForClicksOnContainer ~ emailsContainer:', emailsContainer);

  emailsContainer.addEventListener(
    'click',
    asyncHandler(async () => {
      // 1. check if assistant button is already added

      await wait(500);

      const assistantBtn = document.getElementsByClassName('freshInbox-assistantBtn');

      console.log('🚀 ~ file: index.ts:57 ~ asyncHandler ~ assistantBtn:', assistantBtn);

      // assistant button present, do nothing
      if (assistantBtn && assistantBtn.length > 0 && !![...assistantBtn].find(btn => btn.checkVisibility()))
        return;

      // 2. check if it is an (emails) table container or a single email container

      // 2.1 checking for single email container
      // check if it has a print mail button
      const printEmailBtn = document.querySelector('button[aria-label="Print all"]');

      console.log('🚀 ~ file: index.ts:69 ~ asyncHandler ~ printEmailBtn:', printEmailBtn);

      if (printEmailBtn) {
        // this is a single email container

        // get email node
        const emailNode = document.querySelector('tbody > tr > td span[email] > span')?.parentElement;

        console.log('🚀 ~ file: index.ts:69 ~ asyncHandler ~ emailNode:', emailNode);

        if (!emailNode) return;

        // get email id of current opened email
        const email = emailNode.getAttribute('email');
        // get name
        const name = emailNode.getAttribute('name');
        const assistantBtnContainer = printEmailBtn.closest('div').parentElement;

        console.log('🚀 ~ file: index.ts:85 ~ asyncHandler ~ assistantBtnContainer:', assistantBtnContainer);

        // embed the assistant button for single mail
        embedSingleAssistantBtn({ parent: assistantBtnContainer, email, name });

        return;
      }

      // 2.2 checking for (emails) table container
      // check for row with sender email
      const emailRow = document.querySelector(MAIL_NODES_SELECTOR);

      console.log('🚀 ~ file: index.ts:97 ~ asyncHandler ~ emailRow:', emailRow);

      if (emailRow) {
        // this is emails table

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
    //embed assistant button
    await embedAssistantBtn();

    // re-embed assistant button on url changes
    onURLChange(async url => {
      // get anchor id form the url
      const anchorId = url?.split('#').pop();

      // labels/pages to embed the assistant button on
      const labels = ['inbox', 'starred', 'all', 'spam'];

      //urls to run on with ids: #inbox, #starred, #all, #spam
      if (anchorId && labels.includes(anchorId)) {
        // re-embed the assistant button

        await embedAssistantBtn(true);
      }
    });

    // watch for changes to email table container
    // so that we can know if it's a emails table or a single emailed opened and embed assistant button accordingly
    listenForClicksOnContainer();
  }
})();

// TODO: complete all the necessary TODO comments
