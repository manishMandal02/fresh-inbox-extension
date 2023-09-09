import { IMessageBody, IMessageEvent } from '../content.types';
import { hideLoadingSnackbar, showLoadingSnackbar } from './elements/snackbar';
import { showConfirmModal } from './elements/confirmModal';
import { storageKeys } from '../constants/app.constants';
import {
  handleDeleteAllMails,
  handleUnsubscribe,
  handleUnsubscribeAndDeleteAllMails,
  handleWhitelist,
} from '../utils/emailActions';

export interface IHoverCardElements {
  hoverCard: HTMLDivElement;
  label: HTMLParagraphElement;
  whiteListEmailBtn: HTMLButtonElement;
  unsubscribeBtn: HTMLButtonElement;
  deleteAllMailsBtn: HTMLButtonElement;
  unsubscribeAndDeleteAllMailsBtn: HTMLButtonElement;
}

//* handle mouseover on hoverCard
const handleMouseOverHoverCard = (ev: MouseEvent) => {
  ev.stopPropagation();
  mailMagicGlobalVariables.isMouseOverHoverCard = true;
};
// handle mouseout on hoverCard
const handleMouseOutHoverCard = () => {
  const { hoverCardElements, assistantBtnContainerId } = mailMagicGlobalVariables;

  setTimeout(() => {
    hideHoverCard({ parentElId: assistantBtnContainerId, hoverCardElements });
  }, 500);

  mailMagicGlobalVariables.isMouseOverHoverCard = false;
};

const initializeHoverCard = (): IHoverCardElements => {
  // create hoverCard elements
  // main container
  const hoverCard = document.createElement('div');
  const label = document.createElement('p');
  const btnContainer = document.createElement('div');
  const whiteListEmailBtn = document.createElement('button'); // white list email button
  const unsubscribeBtn = document.createElement('button');
  const deleteAllMailsBtn = document.createElement('button');
  const unsubscribeAndDeleteAllMailsBtn = document.createElement('button');

  /// add classnames
  hoverCard.classList.add('mailMagic-hoverCard');
  label.classList.add('hoverCard-label');
  btnContainer.classList.add('hoverCard-btnContainer');
  whiteListEmailBtn.classList.add('hoverCard-whiteListBtn');
  unsubscribeBtn.classList.add('hoverCard-unsubscribeBtn');
  deleteAllMailsBtn.classList.add('hoverCard-deleteAllMailsBtn');
  unsubscribeAndDeleteAllMailsBtn.classList.add('hoverCard-unsubscribeAndDeleteAllMailsBtn');

  // add text to buttons
  whiteListEmailBtn.innerHTML = 'Keep';
  unsubscribeBtn.innerHTML = 'Unsubscribe';
  deleteAllMailsBtn.innerHTML = 'Delete All Mails';
  unsubscribeAndDeleteAllMailsBtn.innerHTML = 'Unsubscribe + Delete All Mails';

  // append buttons to the btnContainer
  btnContainer.append(whiteListEmailBtn, unsubscribeBtn, deleteAllMailsBtn, unsubscribeAndDeleteAllMailsBtn);

  // append  elements to parent el (Card)
  hoverCard.append(label, btnContainer);

  return {
    hoverCard,
    label,
    whiteListEmailBtn,
    unsubscribeBtn,
    deleteAllMailsBtn,
    unsubscribeAndDeleteAllMailsBtn,
  };
};

// hide hoverCard
type ShowHoverCardParams = {
  parentElId: string;
  hoverCardElements: IHoverCardElements;
  email: string;
  name: string;
};

//* show hover-card
const showHoverCard = async ({ parentElId, hoverCardElements, email, name }: ShowHoverCardParams) => {
  const {
    hoverCard,
    label,
    whiteListEmailBtn,
    unsubscribeBtn,
    deleteAllMailsBtn,
    unsubscribeAndDeleteAllMailsBtn,
  } = hoverCardElements;

  // get parent el from id
  const parentEl = document.getElementById(parentElId);

  parentEl.appendChild(hoverCard);

  mailMagicGlobalVariables.email = email;
  mailMagicGlobalVariables.name = name;

  // add text to label
  label.innerText = `MailMagic: Email Actions for ${name}  (${email})`;

  // stop event propagation for card container
  hoverCard.addEventListener('click', ev => {
    ev.stopPropagation();
  });

  // add mouseover (on hover) event to card container
  hoverCard.addEventListener('mouseover', handleMouseOverHoverCard);
  // add mouseout (on hover) event to card container
  hoverCard.addEventListener('mouseout', handleMouseOutHoverCard);

  // check if the email (currently hovered over) is already unsubscribed or not
  const syncStorageData = await chrome.storage.sync.get(storageKeys.UNSUBSCRIBED_EMAILS);
  if (syncStorageData[storageKeys.UNSUBSCRIBED_EMAILS]?.includes(email)) {
    // if already unsubscribed, show only deleteAllMails button
    unsubscribeBtn.remove();
    unsubscribeAndDeleteAllMailsBtn.remove();
  } else {
    // if not, show all three buttons
    // add onClick listener to unsubscribe button
    unsubscribeBtn.addEventListener('click', handleUnsubscribe);

    // add onClick listener to unsubscribe and delete all mails button
    unsubscribeAndDeleteAllMailsBtn.addEventListener('click', ev => {
      ev.stopPropagation();
      showConfirmModal({
        msg: 'Are you sure you want to delete all mails and unsubscribe from',
        email,
        onConfirmClick: handleUnsubscribeAndDeleteAllMails,
      });
    });
  }

  // add onClick listener to white list email button
  whiteListEmailBtn.addEventListener('click', handleWhitelist);

  // add onClick listener to delete all mails button
  deleteAllMailsBtn.addEventListener('click', ev => {
    ev.stopPropagation();
    showConfirmModal({
      msg: 'Are you sure you want to delete all mails  from',
      email,
      onConfirmClick: handleDeleteAllMails,
    });
  });
  hoverCard.style.display = 'flex';
  hoverCard.style.visibility = 'visible';
};

// hide hoverCard
type HideHoverCardParams = {
  parentElId: string;
  hoverCardElements: IHoverCardElements;
};

//* show hover-card
const hideHoverCard = ({ parentElId, hoverCardElements }: HideHoverCardParams) => {
  const { hoverCard, unsubscribeBtn, deleteAllMailsBtn, unsubscribeAndDeleteAllMailsBtn } = hoverCardElements;

  if (
    mailMagicGlobalVariables.isMouseOverHoverCard ||
    mailMagicGlobalVariables.isMouseOverMailMagicAssistantBtn
  )
    return;
  const parentEl = document.getElementById(parentElId);

  if (parentEl && parentEl.contains(hoverCard)) {
    hoverCard.style.display = 'none';
    hoverCard.style.visibility = 'hidden';
    // get parent el from id

    unsubscribeBtn.remove();
    deleteAllMailsBtn.remove();
    unsubscribeAndDeleteAllMailsBtn.remove();
    parentEl.removeChild(hoverCard);
  }
};

export { initializeHoverCard, showHoverCard, hideHoverCard };
