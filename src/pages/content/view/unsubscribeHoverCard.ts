import { IMessageBody, IMessageEvent } from '../content.types';

export interface IHoverCardElements {
  hoverCard: HTMLDivElement;
  unsubscribeBtn: HTMLButtonElement;
  deleteAllMailsBtn: HTMLButtonElement;
  unsubscribeAndDeleteAllMailsBtn: HTMLButtonElement;
}

const handleUnsubscribe = async (ev: MouseEvent) => {
  ev.stopPropagation();
  try {
    const { email, name } = mailMagicGlobalVariables;
    console.log('clicked: unsubscribeButton', email);
    const messageRes = await chrome.runtime.sendMessage<IMessageBody>({
      event: IMessageEvent.Unsubscribe,
      email,
      name,
    });
  } catch (err) {
    console.log('🚀 ~ file: unsubscribeHoverCard.ts:16 ~ handleUnsubscribe ~ err:', err);
  }
};

const handleDeleteAllMails = async (ev: MouseEvent) => {
  ev.stopPropagation();
  try {
    const { email, name } = mailMagicGlobalVariables;

    await chrome.runtime.sendMessage({ event: IMessageEvent.Delete_All_Mails, email, name });
  } catch (err) {
    console.log('🚀 ~ file: unsubscribeHoverCard.ts:29 ~ handleDeleteAllMails ~ err:', err);
  }
};

const handleUnsubscribeAndDeleteAllMails = async (ev: MouseEvent) => {
  ev.stopPropagation();
  try {
    const { email, name } = mailMagicGlobalVariables;

    await chrome.runtime.sendMessage({ event: IMessageEvent.Unsubscribe_And_Delete_All_Mails, email, name });
  } catch (err) {
    console.log('🚀 ~ file: unsubscribeHoverCard.ts:29 ~ handleDeleteAllMails ~ err:', err);
  }
};

// handle mouseover on hoverCard
const handleMouseOverHoverCard = (ev: MouseEvent) => {
  ev.stopPropagation();
  mailMagicGlobalVariables.isMouseOverHoverCard = true;
};
// handle mouseout on hoverCard
const handleMouseOutHoverCard = () => {
  const { hoverCardElements, mainBtnContainerId } = mailMagicGlobalVariables;

  setTimeout(() => {
    hideHoverCard({ parentElId: mainBtnContainerId, hoverCardElements });
  }, 500);

  mailMagicGlobalVariables.isMouseOverHoverCard = false;
};

const initializeHoverCard = (): IHoverCardElements => {
  // create hoverCard elements
  // main container
  const hoverCard = document.createElement('div');
  const label = document.createElement('p');
  const btnContainer = document.createElement('div');
  const unsubscribeBtn = document.createElement('button');
  const deleteAllMailsBtn = document.createElement('button');
  const unsubscribeAndDeleteAllMailsBtn = document.createElement('button');

  /// add classnames
  hoverCard.classList.add('mailMagic-hoverCard');
  label.classList.add('hoverCard-label');
  btnContainer.classList.add('hoverCard-btnContainer');
  unsubscribeBtn.classList.add('hoverCard-unsubscribeBtn');
  deleteAllMailsBtn.classList.add('hoverCard-deleteAllMailsBtn');
  unsubscribeAndDeleteAllMailsBtn.classList.add('hoverCard-unsubscribeAndDeleteAllMailsBtn');

  // add text to buttons
  unsubscribeBtn.innerHTML = 'Unsubscribe';
  deleteAllMailsBtn.innerHTML = 'Delete All Mails';
  unsubscribeAndDeleteAllMailsBtn.innerHTML = 'Unsubscribe + Delete All Mails';

  // add text to label
  label.innerText = 'MailMagic: Email Actions for {name} & {email}';

  // append buttons to the btnContainer
  btnContainer.append(unsubscribeBtn, deleteAllMailsBtn, unsubscribeAndDeleteAllMailsBtn);

  // append  elements to parent el (Card)
  hoverCard.append(label, btnContainer);

  return { hoverCard, unsubscribeBtn, deleteAllMailsBtn, unsubscribeAndDeleteAllMailsBtn };
};
// hide hoverCard

type ShowHoverCardParams = {
  parentElId: string;
  hoverCardElements: IHoverCardElements;
  email: string;
  name: string;
};

const showHoverCard = ({ parentElId, hoverCardElements, email, name }: ShowHoverCardParams) => {
  const { hoverCard, unsubscribeBtn, deleteAllMailsBtn, unsubscribeAndDeleteAllMailsBtn } = hoverCardElements;

  // get parent el from id
  const parentEl = document.getElementById(parentElId);

  parentEl.appendChild(hoverCard);

  mailMagicGlobalVariables.email = email;
  mailMagicGlobalVariables.name = name;

  // stop event propagation for card container
  hoverCard.addEventListener('click', ev => {
    ev.stopPropagation();
  });

  // add mouseover (on hover) event to card container
  hoverCard.addEventListener('mouseover', handleMouseOverHoverCard);
  // add mouseout (on hover) event to card container
  hoverCard.addEventListener('mouseout', handleMouseOutHoverCard);

  // add onClick listener to buttons
  unsubscribeBtn.addEventListener('click', handleUnsubscribe);
  deleteAllMailsBtn.addEventListener('click', handleDeleteAllMails);
  unsubscribeAndDeleteAllMailsBtn.addEventListener('click', handleDeleteAllMails);
  hoverCard.style.display = 'flex';
  hoverCard.style.visibility = 'visible';
};

// hide hoverCard
type HideHoverCardParams = {
  parentElId: string;
  hoverCardElements: IHoverCardElements;
};

const hideHoverCard = ({ parentElId, hoverCardElements }: HideHoverCardParams) => {
  const { hoverCard, unsubscribeBtn, deleteAllMailsBtn, unsubscribeAndDeleteAllMailsBtn } = hoverCardElements;

  if (mailMagicGlobalVariables.isMouseOverHoverCard || mailMagicGlobalVariables.isMouseOverMailMagicBtn)
    return;
  const parentEl = document.getElementById(parentElId);

  if (parentEl && parentEl.contains(hoverCard)) {
    hoverCard.style.display = 'none';
    hoverCard.style.visibility = 'hidden';
    // get parent el from id

    unsubscribeBtn.removeEventListener('click', handleUnsubscribe);
    deleteAllMailsBtn.removeEventListener('click', handleDeleteAllMails);
    unsubscribeAndDeleteAllMailsBtn.removeEventListener('click', handleDeleteAllMails);
    parentEl.removeChild(hoverCard);
  }
};

export { initializeHoverCard, showHoverCard, hideHoverCard };
