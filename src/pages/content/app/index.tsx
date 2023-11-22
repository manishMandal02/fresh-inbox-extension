import '../style.scss';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import AppModal from '../view/appModal/AppModal';
import wait from '../utils/wait';
import { IMessageBody, IMessageEvent } from '../types/content.types';
import { createRoot } from 'react-dom/client';
import { onURLChange } from '../utils/onURLChange';
import { getSyncStorageByKey } from '../utils/getStorageByKey';
import { embedAssistantBtn } from '../view/assistant-button';
import { watchEmailTableContainerClick } from '../view/assistant-button/helper/watchEmailTableContainerClick';
import { getUserEmailIdFromPage } from '../view/assistant-button/helper/getEmailIdFromPage';
import { showLoadingSnackbar } from '../view/elements/snackbar';

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

(async () => {
  // wait 2s
  await wait(2000);

  // query for user email id on page
  freshInboxGlobalVariables.userEmail = await getUserEmailIdFromPage();

  // check if app is enabled or not
  const isAppEnabled = await getSyncStorageByKey<boolean>('IS_APP_ENABLED');

  // is user Authed or not? (handle multiple user) send email id from the content script
  const isTokenValid = await chrome.runtime.sendMessage<IMessageBody>({
    event: IMessageEvent.CHECK_AUTH_TOKEN,
    userEmail: freshInboxGlobalVariables.userEmail,
  });

  // show settings modal based on app status & auth status
  createRoot(root).render(<AppModal appStatus={isAppEnabled} isTokenValid={isTokenValid} />);

  if (isTokenValid) {
    // embed assistant button
    await embedAssistantBtn();

    // watch url change:
    // re-embed assistant button on url changes (if url supported)
    onURLChange(async () => {
      // re-embed assistant button
      await embedAssistantBtn();
    });

    // watch for container change:
    // check if inbox or a single email view and re-embed assistant button accordingly
    watchEmailTableContainerClick(async () => {
      // re-embed assistant button
      await embedAssistantBtn();
    });
  }
})();
