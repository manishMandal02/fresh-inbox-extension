export interface IHoverCardElements {
  hoverCard: HTMLDivElement;
  unsubscribeBtn: HTMLButtonElement;
  deleteAllMailsBtn: HTMLButtonElement;
  unsubscribeAndDeleteAllMailsBtn: HTMLButtonElement;
}

const handleUnsubscribe = (ev: MouseEvent) => {
  ev.stopPropagation();
  const { email } = (window as any).mailPurge;
  console.log('clicked: unsubscribeButton', email);
};

// handle mouseover on hoverCard
const handleMouseOverHoverCard = () => {
  (window as any).mailPurge = { ...(window as any).mailPurge, isMouseOverHoverCard: true };
};
// handle mouseout on hoverCard
const handleMouseOutHoverCard = () => {
  (window as any).mailPurge = { ...(window as any).mailPurge, isMouseOverHoverCard: false };
  const isMouseOverMailPurgeBtn = (window as any).mailPurge.isMouseOverMailPurgeBtn || false;

  if(!isMouseOverMailPurgeBtn){
    hideHoverCard({parentEl, hoverCardElements})
  }

};

const initializeHoverCard = (): IHoverCardElements => {
  // create hoverCard elements
  // main container
  const hoverCard = document.createElement('div');
  const label = document.createElement('p');
  const unsubscribeBtn = document.createElement('button');
  const deleteAllMailsBtn = document.createElement('button');
  const unsubscribeAndDeleteAllMailsBtn = document.createElement('button');

  /// add classnames
  hoverCard.classList.add('hoverCard');
  label.classList.add('hoverCard-label');
  unsubscribeBtn.classList.add('hoverCard-unsubscribeBtn');
  deleteAllMailsBtn.classList.add('hoverCard-deleteAllMailsBtn');
  unsubscribeAndDeleteAllMailsBtn.classList.add('hoverCard-unsubscribeAndDeleteAllMailsBtn');

  // add text to label
  label.innerText = 'MailPurge: Email Actions for {name} & {email}';

  // append  elements to parent el (Card)
  hoverCard.append(label, unsubscribeBtn, deleteAllMailsBtn, unsubscribeAndDeleteAllMailsBtn);

  return { hoverCard, unsubscribeBtn, deleteAllMailsBtn, unsubscribeAndDeleteAllMailsBtn };
};
// hide hoverCard

type ShowHoverCardParams = {
  parentEl: HTMLDivElement;
  hoverCardElements: IHoverCardElements;
  email: string;
  name: string;
};
const showHoverCard = ({ parentEl, hoverCardElements, email, name }: ShowHoverCardParams) => {
  const { hoverCard, unsubscribeBtn, deleteAllMailsBtn, unsubscribeAndDeleteAllMailsBtn } = hoverCardElements;
  // hoverCard.style.top = `${parentEl.offsetTop}px`;
  parentEl.appendChild(hoverCard);

  (window as any).mailPurge = { email, name };

  // add mouseover (on hover) event to card container

  hoverCard.addEventListener('mouseover', handleMouseOverHoverCard);
  hoverCard.addEventListener('mouseout', handleMouseOutHoverCard);

  // add onClick listener to buttons
  // unsubscribe btn
  unsubscribeBtn.addEventListener('click', handleUnsubscribe);
  // deleteAllMails btn
  deleteAllMailsBtn.addEventListener('click', (ev: MouseEvent) => {
    ev.stopPropagation();
    console.log('clicked: deleteAllMails', email, name);
  });
  // unsubscribeAndDeleteAllMails btn
  unsubscribeAndDeleteAllMailsBtn.addEventListener('click', (ev: MouseEvent) => {
    ev.stopPropagation();
    console.log('clicked: unsubscribeAndDeleteAllMails', email, name);
  });
  hoverCard.style.display = 'flex';
  hoverCard.style.visibility = 'visible';
};

// hide hoverCard
type HideHoverCardParams = {
  parentEl: Element;
  hoverCardElements: IHoverCardElements;
};

const hideHoverCard = ({ parentEl, hoverCardElements }: HideHoverCardParams) => {
  const { hoverCard, unsubscribeBtn, deleteAllMailsBtn, unsubscribeAndDeleteAllMailsBtn } = hoverCardElements;

  hoverCard.style.display = 'none';
  hoverCard.style.visibility = 'hidden';

  parentEl.removeChild(hoverCard);
  unsubscribeBtn.removeEventListener('click', handleUnsubscribe);
  deleteAllMailsBtn.removeEventListener('click', handleUnsubscribe);
  unsubscribeAndDeleteAllMailsBtn.removeEventListener('click', handleUnsubscribe);
};

export { initializeHoverCard, showHoverCard, hideHoverCard };
