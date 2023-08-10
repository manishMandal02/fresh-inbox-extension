export interface IHoverCardElements {
  hoverCard: HTMLDivElement;
  unsubscribeBtn: HTMLButtonElement;
  deleteAllMailsBtn: HTMLButtonElement;
  unsubscribeAndDeleteAllMailsBtn: HTMLButtonElement;
}

const handleUnsubscribe = (ev: MouseEvent) => {
  ev.stopPropagation();
  const { email } = mailPurgeGlobalVariables;
  console.log('clicked: unsubscribeButton', email);
};

// handle mouseover on hoverCard
const handleMouseOverHoverCard = (ev: MouseEvent) => {
  ev.stopPropagation();
  mailPurgeGlobalVariables.isMouseOverHoverCard = true;
};
// handle mouseout on hoverCard
const handleMouseOutHoverCard = () => {
  const { hoverCardElements, mainBtnContainerId } = mailPurgeGlobalVariables;

  setTimeout(() => {
    hideHoverCard({ parentElId: mainBtnContainerId, hoverCardElements });
  }, 500);

  mailPurgeGlobalVariables.isMouseOverHoverCard = false;
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
  hoverCard.classList.add('hoverCard');
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
  label.innerText = 'MailPurge: Email Actions for {name} & {email}';

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

  mailPurgeGlobalVariables.email = email;
  mailPurgeGlobalVariables.name = name;

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
  deleteAllMailsBtn.addEventListener('click', (ev: MouseEvent) => {
    ev.stopPropagation();
    console.log('clicked: deleteAllMails', email, name);
  });
  unsubscribeAndDeleteAllMailsBtn.addEventListener('click', (ev: MouseEvent) => {
    ev.stopPropagation();
    console.log('clicked: unsubscribeAndDeleteAllMails', email, name);
  });
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

  if (mailPurgeGlobalVariables.isMouseOverHoverCard || mailPurgeGlobalVariables.isMouseOverMailPurgeBtn)
    return;
  const parentEl = document.getElementById(parentElId);

  if (parentEl && parentEl.contains(hoverCard)) {
    hoverCard.style.display = 'none';
    hoverCard.style.visibility = 'hidden';
    // get parent el from id

    parentEl.removeChild(hoverCard);
    unsubscribeBtn.removeEventListener('click', handleUnsubscribe);
    deleteAllMailsBtn.removeEventListener('click', handleUnsubscribe);
    unsubscribeAndDeleteAllMailsBtn.removeEventListener('click', handleUnsubscribe);
  }
};

export { initializeHoverCard, showHoverCard, hideHoverCard };
