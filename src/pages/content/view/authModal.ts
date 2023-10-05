import { IMessageEvent } from '../types/content.types';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { embedAssistantBtn } from './assistantButton';

const handleAuthBtnClick = async ev => {
  ev.stopPropagation();

  const res = await chrome.runtime.sendMessage({ event: IMessageEvent.Launch_Auth_Flow });
  if (res) {
    // success: close the modal
    removeAuthModal();
    // embed assistant button
    await embedAssistantBtn();
    // add Mail Magic main buttons
  } else {
    // failed auth: show error message
    const errorMsg = document.getElementById('authModal-errorMsg');
    errorMsg.style.visibility = 'visible';
  }
};

const handleDisableBtnClick = async (ev: MouseEvent) => {
  ev.stopPropagation();
  const res = await chrome.runtime.sendMessage({ event: IMessageEvent.DISABLE_MAIL_MAGIC });
  if (res) {
    logger.dev('✅ Mail Magic has been disabled', 'authModal.ts:31 ~ handleDisableBtnClick()');
  } else {
    logger.dev('❌ Failed to disable Mail Magic', 'authModal.ts:33 ~ handleDisableBtnClick()');
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
  const disableMailMagic = document.createElement('p');

  // add content to the elements
  title.innerText = 'Give Mail Magic access to your  Gmail.';
  authBtn.innerText = 'Give Access';
  errorMsg.innerHTML = '❌ Failed to complete the authentication, Please try again.';
  disableMailMagic.innerText = 'disable Mail Magic';

  // add class to elements
  modalContainer.id = 'mailMagic-authModal';
  backdrop.id = 'authModal-backdrop';
  modalCard.id = 'authModal-card';
  title.id = 'authModal-title';
  authBtn.id = 'authModal-authBtn';
  errorMsg.id = 'authModal-errorMsg';
  disableMailMagic.id = 'authModal-disableBtn';

  // add on click lister
  // auth btn
  authBtn.addEventListener('click', asyncHandler(handleAuthBtnClick));
  // disable btn
  disableMailMagic.addEventListener('click', asyncHandler(handleDisableBtnClick));

  modalCard.append(title, errorMsg, authBtn, disableMailMagic);

  modalContainer.append(backdrop, modalCard);

  document.body.appendChild(modalContainer);
};

const removeAuthModal = () => {
  // const create modal
  const modalContainer = document.getElementById('mailMagic-authModal');
  const modalCard = document.getElementById('authModal-card');
  const authBtn = document.getElementById('authModal-authBtn');
  const disableMailMagic = document.getElementById('authModal-disableBtn');

  // remove elements
  if (authBtn) authBtn.remove();
  if (disableMailMagic) disableMailMagic.remove();

  modalCard.remove();

  modalContainer.remove();
};

export { renderAuthModal };
