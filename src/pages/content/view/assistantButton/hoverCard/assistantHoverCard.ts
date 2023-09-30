import { showConfirmModal } from '../../elements/confirmModal';
import {
  handleDeleteAllMails,
  handleUnsubscribe,
  handleUnsubscribeAndDeleteAllMails,
  handleWhitelist,
} from '../../../utils/emailActions';
import { getUnsubscribedEmails } from '../../../utils/getEmailsFromStorage';

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
    // btn.style.display = 'none';
  }
};

const showButtons = (buttons: HTMLButtonElement[]) => {
  for (const btn of buttons) {
    // btn.style.display = 'block';
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

  mailMagicGlobalVariables.email = email;
  mailMagicGlobalVariables.name = name;

  // add text to label
  label.innerText = `MailMagic: Email Actions for ${name}  (${email})`;

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

  console.log('🚀 ~ file: assistantHoverCard.ts:125 ~ showHoverCard ~ isUnsubscribed:', isUnsubscribed);

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
        await handleUnsubscribe();
      })();
    });

    // onClick listener to unsubscribe and delete all mails button
    unsubscribeAndDeleteAllMailsBtn.addEventListener('click', ev => {
      ev.stopPropagation();
      showConfirmModal({
        msg: 'Are you sure you want to delete all mails and unsubscribe from',
        email,
        onConfirmClick: async () => {
          handleUnsubscribeAndDeleteAllMails({ shouldRefreshTable: true });
        },
      });
    });
  }

  // onClick listener to white list email button
  whiteListEmailBtn.addEventListener('click', ev => {
    ev.stopPropagation();
    (async () => {
      await handleWhitelist();
    })();
  });

  // onClick listener to delete all mails button
  deleteAllMailsBtn.addEventListener('click', ev => {
    ev.stopPropagation();
    showConfirmModal({
      email,
      msg: 'Are you sure you want to delete all mails from',
      onConfirmClick: async () => {
        await handleDeleteAllMails(true);
      },
    });
  });

  console.log(
    '🔵 ~ file: assistantHoverCard.ts:191 ~ showHoverCard ~ hoverCard.childNodes:',
    hoverCard.childNodes
  );

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
  const { hoverCard, whiteListEmailBtn, unsubscribeBtn, deleteAllMailsBtn, unsubscribeAndDeleteAllMailsBtn } =
    hoverCardElements;

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
