import { IMessageEvent } from '../types/content.types';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { embedAssistantBtn } from './assistantButton';

const handleAuthBtnClick = async ev => {
  ev.stopPropagation();

  const res = await chrome.runtime.sendMessage({
    event: IMessageEvent.LAUNCH_AUTH_FLOW,
    email: freshInboxGlobalVariables.userEmail,
  });
  if (res) {
    // success: close the modal
    removeAuthModal();
    // embed assistant button
    await embedAssistantBtn();
    // checks after auth success
    await chrome.runtime.sendMessage({
      event: IMessageEvent.CHECKS_AFTER_AUTH,
    });
  } else {
    // failed auth: show error message
    const errorMsg = document.getElementById('authModal-errorMsg');
    errorMsg.style.visibility = 'visible';
  }
};

const handleDisableBtnClick = async (ev: MouseEvent) => {
  ev.stopPropagation();
  const res = await chrome.runtime.sendMessage({ event: IMessageEvent.DISABLE_FRESH_INBOX });

  // TODO: remove assistant buttons (create a utility fn)
  // TODO: update settings button color/icon

  if (res) {
    logger.dev('✅ Fresh Inbox has been disabled', 'authModal.ts:31 ~ handleDisableBtnClick()');
  } else {
    logger.dev('❌ Failed to disable Fresh Inbox', 'authModal.ts:33 ~ handleDisableBtnClick()');
  }
};

const renderAuthModal = () => {
  // const create modal
  const modalContainer = document.createElement('div');
  const backdrop = document.createElement('div');
  const modalCard = document.createElement('div');
  const title = document.createElement('p');
  const errorMsg = document.createElement('p');
  const authBtn = document.createElement('button');
  const disableFreshInbox = document.createElement('p');

  // add content to the elements
  title.innerText = 'Give Fresh Inbox access to your  Gmail.';
  authBtn.innerText = 'Give Access';
  errorMsg.innerHTML = '❌ Failed to complete the authentication, Please try again.';
  disableFreshInbox.innerText = 'disable Fresh Inbox';

  // add class to elements
  modalContainer.id = 'freshInbox-authModal';
  backdrop.id = 'authModal-backdrop';
  modalCard.id = 'authModal-card';
  title.id = 'authModal-title';
  authBtn.id = 'authModal-authBtn';
  errorMsg.id = 'authModal-errorMsg';
  disableFreshInbox.id = 'authModal-disableBtn';

  // add on click lister
  // auth btn
  authBtn.addEventListener('click', asyncHandler(handleAuthBtnClick));
  // disable btn
  disableFreshInbox.addEventListener('click', asyncHandler(handleDisableBtnClick));

  modalCard.append(title, errorMsg, authBtn, disableFreshInbox);

  modalContainer.append(backdrop, modalCard);

  document.body.appendChild(modalContainer);
};

const removeAuthModal = () => {
  // const create modal
  const modalContainer = document.getElementById('freshInbox-authModal');
  const modalCard = document.getElementById('authModal-card');
  const authBtn = document.getElementById('authModal-authBtn');
  const disableFreshInbox = document.getElementById('authModal-disableBtn');

  // remove elements
  if (authBtn) authBtn.remove();
  if (disableFreshInbox) disableFreshInbox.remove();

  modalCard.remove();

  modalContainer.remove();
};

export { renderAuthModal };
