import { createRoot } from 'react-dom/client';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';

import AppModal from '../view/appModal/AppModal';

import '../style.scss';

import { AsyncCallback, IMessageBody, IMessageEvent } from '../types/content.types';

import wait from '../utils/wait';
import { getEmailIdFromPage } from '../utils/getEmailIdFromPage';
import { onURLChange } from '../utils/onURLChange';
import { asyncHandler } from '../utils/asyncHandler';
import { getSyncStorageByKey } from '../utils/getStorageByKey';
import { logger } from '../utils/logger';
import { embedAssistantBtn } from '../view/assistant-button';
import { retryAtIntervals } from '../utils/retryAtIntervals';

// reload on update
refreshOnUpdate('pages/content');

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
const getEmailsTableContainer = () => {
  // gmail table's top container's full path
  // it's either of the 2 (keeps changing randomly)
  const containerXPaths = [
    '/html/body/div[7]/div[3]/div/div[2]/div[2]/div/div/div',
    '/html/body/div[8]/div[3]/div/div[2]/div[2]/div/div',
  ];

  let tableContainer: Node | null = null;

  // loop the x-paths to get the table container
  for (const xPath of containerXPaths) {
    tableContainer = document.evaluate(
      xPath,
      // Context node
      document,
      // Namespace resolver
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;

    //  break the loop it table container found
    if (tableContainer) break;
  }

  return tableContainer;
};

// watch for main container click (if a single is opened or navigated to diff categories)
// re-embed assistant button based on the container (weather it is an inbox or a single email)
const reEmbedAssistantBtnOnContainerClick = async (callback: AsyncCallback) => {
  let emailsContainer: Node | null = null;

  // retry to check if the emails are found on page or not
  // if not, then retry it for 3 times with 2 seconds interval
  await retryAtIntervals<boolean>({
    retries: 3,
    interval: 2000,
    callback: async () => {
      const topContainer = await getEmailsTableContainer();

      console.log('🚀 ~ file: index.tsx:81 ~ retryAtIntervals: ~ topContainer:', topContainer);

      if (topContainer) {
        emailsContainer = topContainer;
        return true;
      }
    },
  });

  if (!emailsContainer) {
    logger.info('Email Container not found', 'content/app/index.tsx:76');
    return;
  }

  const handleContainerClick = async () => {
    await wait(1000);

    await callback();
  };

  // // list to on click
  emailsContainer.addEventListener('click', asyncHandler(handleContainerClick));

  // list to mouse up
  // emailsContainer.addEventListener('mouseup', asyncHandler(handleContainerClick));
};

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

    // watch url change:
    // re-embed assistant button on url changes (if url supported)
    onURLChange(async () => {
      console.log('🚀 ~ file: index.tsx:121 ~ onURLChange');

      // re-embed assistant button
      await embedAssistantBtn();
    });

    // watch for container change:
    // check if inbox or a single email view and re-embed assistant button accordingly
    reEmbedAssistantBtnOnContainerClick(async () => {
      console.log('🚀 ~ file: index.tsx:130 ~ reEmbedAssistantBtnOnContainerClick: container click');

      // re-embed assistant button
      await embedAssistantBtn();
    });
  }
})();
