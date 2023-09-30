import { showConfirmModal } from '../../elements/confirmModal';
import {
  handleUnsubscribeAction,
  handleDeleteAllMailsAction,
  handleWhitelistAction,
  handleUnsubscribeAndDeleteAction,
} from '../../../utils/emailActions';
import { getUnsubscribedEmails } from '../../../utils/getEmailsFromStorage';
import { addTooltip } from '../../elements/tooltip';
import { limitCharLength } from '@src/pages/content/utils/limitCharLength';

export interface IHoverCardElements {
  hoverCard: HTMLDivElement;
  label: HTMLParagraphElement;
  whiteListEmailBtn: HTMLButtonElement;
  unsubscribeBtn: HTMLButtonElement;
  deleteAllMailsBtn: HTMLButtonElement;
  unsubscribeAndDeleteAllMailsBtn: HTMLButtonElement;
}

// hide button
const hideButtons = (buttons: HTMLButtonElement[]) => {
  for (const btn of buttons) {
    btn.style.display = 'none';
  }
};

const showButtons = (buttons: HTMLButtonElement[]) => {
  for (const btn of buttons) {
    btn.style.display = 'block';
  }
};

// handle hover
// mouse over
const handleMouseOver = (ev: MouseEvent) => {
  ev.stopPropagation();
  mailMagicGlobalVariables.isMouseOverHoverCard = true;
};

// mouse out
const handleMouseOut = () => {
  const { hoverCardElements, assistantBtnContainerId } = mailMagicGlobalVariables;

  setTimeout(() => {
    hideHoverCard({ parentElId: assistantBtnContainerId, hoverCardElements });
  }, 500);

  mailMagicGlobalVariables.isMouseOverHoverCard = false;
};

// initialize hover card
export const initializeHoverCard = (): IHoverCardElements => {
  // create hoverCard elements
  // main container
  const hoverCard = document.createElement('div');
  const label = document.createElement('p');
  const btnContainer = document.createElement('div');
  // action buttons
  const whiteListEmailBtn = document.createElement('button');
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
  unsubscribeAndDeleteAllMailsBtn.innerHTML = 'Unsubscribe + Delete';

  // append buttons to the btnContainer
  btnContainer.append(whiteListEmailBtn, unsubscribeBtn, deleteAllMailsBtn, unsubscribeAndDeleteAllMailsBtn);

  // append  elements to parent el (Card)
  hoverCard.append(label, btnContainer);

  // add tooltip to the buttons
  addTooltip(whiteListEmailBtn, 'Keep this email in your inbox');
  addTooltip(unsubscribeBtn, 'Unsubscribe this email');
  addTooltip(deleteAllMailsBtn, 'Delete all emails from this sender');
  addTooltip(unsubscribeAndDeleteAllMailsBtn, 'Unsubscribe and delete emails from this sender');

  return {
    hoverCard,
    label,
    whiteListEmailBtn,
    unsubscribeBtn,
    deleteAllMailsBtn,
    unsubscribeAndDeleteAllMailsBtn,
  };
};

//* show hover-card
type ShowHoverCardParams = {
  parentElId: string;
  hoverCardElements: IHoverCardElements;
  email: string;
  name: string;
};

export const showHoverCard = async ({ parentElId, hoverCardElements, email, name }: ShowHoverCardParams) => {
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

  // add text to label
  label.innerHTML = `Email Actions for <strong>${limitCharLength(name, 20)}</strong>`;

  // add tooltip to the label, show email on hover
  addTooltip(label.firstElementChild as HTMLElement, email);

  // stop event propagation for card container
  hoverCard.addEventListener('click', ev => {
    ev.stopPropagation();
  });

  // mouseover (on hover) event to card container
  hoverCard.addEventListener('mouseover', handleMouseOver);

  // mouseout (on hover) event to card container
  hoverCard.addEventListener('mouseout', handleMouseOut);

  // check if the email (currently hovered over) is already unsubscribed or not
  const unsubscribedEmailsList = await getUnsubscribedEmails();
  const isUnsubscribed = unsubscribedEmailsList?.includes(email);

  //TODO: handle removing of assitant btn based on action

  if (isUnsubscribed) {
    // if already unsubscribed, show only deleteAllMails button
    // hide other buttons
    hideButtons([unsubscribeBtn, unsubscribeAndDeleteAllMailsBtn]);
  } else {
    // if not, show all three buttons

    showButtons([unsubscribeBtn, unsubscribeAndDeleteAllMailsBtn]);
    // onClick listener to unsubscribe button
    unsubscribeBtn.addEventListener('click', () => {
      (async () => {
        await handleUnsubscribeAction({ email, btnContainerId: 'hoverCard-btnContainer' });
      })();
    });

    // onClick listener to unsubscribe and delete all mails button
    unsubscribeAndDeleteAllMailsBtn.addEventListener('click', async ev => {
      ev.stopPropagation();
      await handleUnsubscribeAndDeleteAction({
        email,
        btnContainerId: 'hoverCard-btnContainer',
        shouldRefreshTable: true,
      });
    });
  }

  // onClick listener to white list email button
  whiteListEmailBtn.addEventListener('click', ev => {
    ev.stopPropagation();
    (async () => {
      await handleWhitelistAction({ email, btnContainerId: 'hoverCard-btnContainer' });
    })();
  });

  // onClick listener to delete all mails button
  deleteAllMailsBtn.addEventListener('click', async ev => {
    ev.stopPropagation();
    await handleDeleteAllMailsAction({
      email,
      btnContainerId: 'hoverCard-btnContainer',
      shouldRefreshTable: true,
    });
  });

  // show card
  hoverCard.style.display = 'flex';
  hoverCard.style.visibility = 'visible';
};

//* hide hoverCard
type HideHoverCardParams = {
  parentElId: string;
  hoverCardElements: IHoverCardElements;
};

export const hideHoverCard = ({ parentElId, hoverCardElements }: HideHoverCardParams) => {
  const { hoverCard } = hoverCardElements;

  // if mouse is hovered over the card or assistant button then do nothing
  if (
    mailMagicGlobalVariables.isMouseOverHoverCard ||
    mailMagicGlobalVariables.isMouseOverMailMagicAssistantBtn
  )
    return;

  //
  // get parent el from id
  const parentEl = document.getElementById(parentElId);

  console.log('🚀 ~ file: assistantHoverCard.ts:215 ~ hideHoverCard ~ parentEl:', parentEl);

  if (parentEl?.contains(hoverCard)) {
    // hide the card
    hoverCard.style.display = 'none';
    hoverCard.style.visibility = 'hidden';

    // remove hover card from parentEl
    parentEl.removeChild(hoverCard);
  }
};
