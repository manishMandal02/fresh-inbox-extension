import { createRoot } from 'react-dom/client';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';

import AppModal from '../view/appModal/AppModal';

import '../style.scss';

import { embedAssistantBtn } from '../view/assistant-button';
import { IMessageBody, IMessageEvent } from '../types/content.types';

import wait from '../utils/wait';
import { getEmailIdFromPage } from '../utils/getEmailIdFromPage';
import { onURLChange } from '../utils/onURLChange';
import { asyncHandler } from '../utils/asyncHandler';
import { getSyncStorageByKey } from '../utils/getStorageByKey';
import { showLoadingSnackbar, showSnackbar } from '../view/elements/snackbar';
import { logger } from '../utils/logger';

// react root
const root = document.createElement('div');
root.id = 'fresh-inbox-react-root';
document.body.append(root);

root.style.position = 'fixed';
root.style.zIndex = '10000';
root.style.top = '20px';
root.style.right = '200px';

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

// TODO: complete all the necessary TODO comments

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

  console.log(
    '🚀 ~ file: index.tsx:69 ~ reEmbedAssistantBtnOnContainerClick ~ emailsContainer:',
    emailsContainer
  );

  if (!emailsContainer) {
    logger.info('Email Container not found', 'content/app/index.tsx:76');
  }

  const handleContainerClick = async () => {
    await wait(750);

    const assistantBtn = document.getElementsByClassName('freshInbox-assistantBtn');

    // check if assistant button is already present
    // if present, do nothing
    if (assistantBtn && assistantBtn.length > 0 && !![...assistantBtn].find(btn => btn.checkVisibility()))
      return;

    // assistant button not found

    // embed assistant
    embedAssistantBtn(true);
  };

  // list to on click
  emailsContainer.addEventListener('click', asyncHandler(handleContainerClick));

  // list to mouse up
  emailsContainer.addEventListener('mouseup', asyncHandler(handleContainerClick));
};

refreshOnUpdate('pages/content');

(async () => {
  // wait 2s
  await wait(2000);

  // query for user email id on page
  freshInboxGlobalVariables.userEmail = await getEmailIdFromPage();

  console.log('🚀 ~ file: index.tsx:102 ~ freshInboxGlobalVariables:', freshInboxGlobalVariables.userEmail);

  // check if app is enabled or not
  const isAppEnabled = await getSyncStorageByKey<boolean>('IS_APP_ENABLED');

  freshInboxGlobalVariables.isAppEnabled = isAppEnabled;

  // is user Authed or not? (handle multiple user) send email id from the content script
  const isTokenValid = await chrome.runtime.sendMessage<IMessageBody>({
    event: IMessageEvent.CHECK_AUTH_TOKEN,
    userEmail: freshInboxGlobalVariables.userEmail,
  });

  // show settings modal based on app status & auth status
  createRoot(root).render(<AppModal isAppEnabled={isAppEnabled} isTokenValid={isTokenValid} />);

  if (isTokenValid) {
    // embed assistant button
    await embedAssistantBtn();

    // watch url change:  re-embed assistant button on url changes (if url supported)
    onURLChange(async () => {
      await embedAssistantBtn(true);
    });

    // watch for container/page change:
    // so that we can know if it's a inbox or a single emailed opened and embed assistant button accordingly
    reEmbedAssistantBtnOnContainerClick();
  }
})();
