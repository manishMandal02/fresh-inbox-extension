import '../style.scss';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import AppModal from '../view/appModal/AppModal';
import wait from '../utils/wait';
import { IMessageEvent } from '../types/content.types';
import { createRoot } from 'react-dom/client';
import { getSyncStorageByKey } from '../utils/getStorageByKey';
import { embedAssistantBtn } from '../view/assistant-button';
import { getUserEmailIdFromPage } from '../view/assistant-button/helper/getEmailIdFromPage';
import { publishEvent } from '../utils/publishEvent';
import { storageKeys } from '../constants/app.constants';
import { watchEmailTableContainerClick } from '../view/assistant-button/helper/watchEmailTableContainerClick';
import { onURLChange } from '../utils/onURLChange';
import { generateStorageKey } from '../utils/generateStorageKey';

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
  await wait(1000);

  // query for user email id on page
  freshInboxGlobalVariables.userEmail = await getUserEmailIdFromPage();

  if (!freshInboxGlobalVariables.userEmail) return;

  // check if app is enabled or not
  let isAppEnabled = await getSyncStorageByKey<boolean>('IS_APP_ENABLED');

  // is user Authed or not? (handle multiple user) send email id from the content script
  const isTokenValid = await publishEvent({ event: IMessageEvent.CHECK_AUTH_TOKEN });

  // check if app status not synced with token/auth
  if (typeof isAppEnabled === 'undefined') {
    const userStorageKey = generateStorageKey('IS_APP_ENABLED');
    // update chrome storage
    await chrome.storage.sync.set({ [userStorageKey]: true });
    isAppEnabled = true;
  }

  // show settings modal based on app status & auth status
  createRoot(root).render(<AppModal appStatus={isAppEnabled} isTokenValid={isTokenValid} />);

  if (isTokenValid) {
    // embed assistant button
    await embedAssistantBtn();

    // watch for container change:
    // check if inbox or a single email view and re-embed assistant button accordingly
    await watchEmailTableContainerClick(async () => {
      // re-embed assistant button
      await embedAssistantBtn();
    });

    // watch url change:
    // re-embed assistant button on url changes (if url supported)
    onURLChange(async () => {
      // re-embed assistant button
      await embedAssistantBtn();
    });
  }
})();
