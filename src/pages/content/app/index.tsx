import { createRoot } from 'react-dom/client';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';

import SettingsModal from '../view/settingsModal/SettingsModal';

import '../style.scss';

import { embedAssistantBtn } from '../view/assistantButton';
import { renderAuthModal } from '../view/authModal';
import { IMessageBody, IMessageEvent } from '../types/content.types';

import wait from '../utils/wait';
import { getEmailIdFromPage } from '../utils/getEmailIdFromPage';
import { onURLChange } from '../utils/onURLChange';
import { asyncHandler } from '../utils/asyncHandler';
import { getSyncStorageByKey } from '../view/settingsModal/helpers/getStorageByKey';
import { showLoadingSnackbar, showSnackbar } from '../view/elements/snackbar';

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

  //TODO: confirm modal don't show again checkbox

  // check if app is enabled or not
  const appStatus = await getSyncStorageByKey<boolean>('IS_APP_ENABLED');

  freshInboxGlobalVariables.isAppEnabled = appStatus;

  // get client id from evn variables
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // show settings modal based on app status
  createRoot(root).render(<SettingsModal isAppEnabled={appStatus} />);

  // is user Authed or not? (handle multiple user) send email id from the content script
  const isTokenValid = await chrome.runtime.sendMessage<IMessageBody>({
    clientId,
    event: IMessageEvent.CHECK_AUTH_TOKEN,
    userEmail: freshInboxGlobalVariables.userEmail,
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
