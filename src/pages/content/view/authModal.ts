import { IMessageBody, IMessageEvent } from '../types/content.types';
import { asyncHandler } from '../utils/asyncHandler';
import { disableApp } from '../utils/disableApp';
import { embedAssistantBtn } from './assistantButton';
import { updateFreshInboxSettingsBtn } from './freshInboxSettingsBtn';

const handleAuthBtnClick = async () => {
  // get client id from evn variables
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const res = await chrome.runtime.sendMessage<IMessageBody>({
    clientId,
    event: IMessageEvent.LAUNCH_AUTH_FLOW,
    emails: [freshInboxGlobalVariables.userEmail],
  });
  if (res) {
    // auth success
    // update settings button
    updateFreshInboxSettingsBtn({ isDisabled: false });
    // close the modal
    removeAuthModal();

    // embed assistant button
    await embedAssistantBtn();

    // run checks after successful auth
    await chrome.runtime.sendMessage<IMessageBody>({
      event: IMessageEvent.CHECKS_AFTER_AUTH,
    });
  } else {
    // failed auth
    // show error message
    const errorMsg = document.getElementById('authModal-errorMsg');
    errorMsg.style.visibility = 'visible';
  }
};

const handleDisableBtnClick = async () => {
  await disableApp();
};

const renderAuthModal = () => {
  // const create modal
  const modalContainer = document.createElement('div');
  const backdrop = document.createElement('div');
  const modalCard = document.createElement('div');
  const errorMsg = document.createElement('p');

  // add content to the elements
  errorMsg.innerHTML = '❌ Failed to connect Fresh Inbox to your Gmail, Please try again.';

  // add class to elements
  modalContainer.id = 'freshInbox-authModal';
  backdrop.id = 'authModal-backdrop';
  modalCard.id = 'authModal-card';
  // error msg
  errorMsg.id = 'authModal-errorMsg';

  // get app status
  const appStatus = freshInboxGlobalVariables.isAppEnabled;

  modalCard.innerHTML = `
  <h4> 
  Fresh Inbox helps you keep your Inbox clean, <br />
  it can unsubscribe from unwanted newsletters & mailing lists, 🧹 delete 100s of emails with just a single click 
  </h4>
  <p>Checkout a quick walkthrough of Fresh Inbox to know more <a href="https://www.youtube.com/watch?v=testvideo" target='_blank' rel='noreferrer'>Link</a> </p>

  <h5> Connect Fresh Inbox to ✉️ Gmail</h5>
  <p>Fresh Inbox needs access to your Gmail account to work. Click the button below to connect.</p>

  <button id="authTab-connectButton">
      Connect to Gmail
  </button>
  <h6>No data leaves your browser, everything happens in your own system.</h6>

  <p id='authTab-disableBtn'>${!appStatus ? 'Fresh Inbox is currently disabled' : 'Disable Fresh Inbox'}</p>
  `;

  modalCard.append(errorMsg);

  modalContainer.append(backdrop, modalCard);

  document.body.appendChild(modalContainer);

  // add on click lister
  const authBtn = document.getElementById('authTab-connectButton');
  // auth btn
  authBtn.addEventListener('click', asyncHandler(handleAuthBtnClick));

  if (appStatus) {
    const disableBtn = document.getElementById('authTab-disableBtn');
    // disable btn
    disableBtn.addEventListener('click', asyncHandler(handleDisableBtnClick));
  }
};

const removeAuthModal = () => {
  // get container el
  const modalContainer = document.getElementById('freshInbox-authModal');
  const backdrop = document.getElementById('authModal-backdrop');
  const modalCard = document.getElementById('authModal-card');
  // get child elements of modal card
  for (const child of modalCard.childNodes) {
    // remove child
    child.remove();
  }

  // remove modal card
  modalCard.remove();
  // remove backdrop
  backdrop.remove();
  // remove container
  modalContainer.remove();
};

export { renderAuthModal };
