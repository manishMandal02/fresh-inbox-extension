import { IMessageEvent } from '../content.types';

type HandleAuthBntClickParams = {
  ev: MouseEvent;
  embedMailMagicBtn: () => void;
};

const handleAuthBtnClick = async ({ ev, embedMailMagicBtn }: HandleAuthBntClickParams) => {
  ev.stopPropagation();

  const res = await chrome.runtime.sendMessage({ event: IMessageEvent.Launch_Auth_Flow });
  if (res) {
    // success: close the modal
    removeAuthModal();
    // render main mail-magic btn for each mail
    embedMailMagicBtn();
    // add Mail Magic main buttons
  } else {
    // failed auth: show error message
    const errorMsg = document.getElementById('authModal-errorMsg');
    errorMsg.style.visibility = 'visible';
  }

  console.log('🚀 ~ file: authModal.ts:9 ~ handleAuthBtnClick ~ res:', res);
};

const handleDisableBtnClick = async (ev: MouseEvent) => {
  ev.stopPropagation();
  const res = await chrome.runtime.sendMessage({ event: IMessageEvent.Disable_MailMagic });
  if (res) {
    console.log('✅ Mail Magic has been disabled.');
  } else {
    console.log('❌ Failed to disabled Mail Magic.');
  }
};

type RenderAuthModalParams = {
  embedMailMagicBtn: () => void;
};

const renderAuthModal = ({ embedMailMagicBtn }: RenderAuthModalParams) => {
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
  authBtn.addEventListener('click', ev => handleAuthBtnClick({ ev, embedMailMagicBtn }));
  // disable btn
  disableMailMagic.addEventListener('click', handleDisableBtnClick);

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
