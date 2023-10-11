import { refreshEmailsTable } from '@src/pages/content/utils/refreshEmailsTable';
import {
  handleUnsubscribeAction,
  handleDeleteAllMailsAction,
  handleWhitelistAction,
  handleUnsubscribeAndDeleteAction,
} from '../../../utils/emailActions';
import { getUnsubscribedEmails } from '../../../utils/getEmailsFromStorage';
import { addTooltip } from '../../elements/tooltip';
import { limitCharLength } from '@src/pages/content/utils/limitCharLength';
import { asyncHandler } from '@src/pages/content/utils/asyncHandler';

export interface IHoverCardElements {
  hoverCard: HTMLDivElement;
  label: HTMLParagraphElement;
  whiteListEmailBtn: HTMLButtonElement;
  unsubscribeBtn: HTMLButtonElement;
  deleteAllMailsBtn: HTMLButtonElement;
  unsubscribeAndDeleteAllMailsBtn: HTMLButtonElement;
}

// TODO: a bug that stops the hover card from removing when the mouse is moved out of the button or card 
//TODO:  handle the removal of previous hover card before rendering a new one

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

// shows a message when the email is already unsubscribed
const actionInfoMsg = (
  label: HTMLParagraphElement,
  shouldShow: boolean,
  msg = 'This email is already unsubscribed'
) => {
  if (shouldShow) {
    // add action info msg
    const span = document.createElement('span');

    span.innerText = msg;

    label.appendChild(span);
  } else {
    // remove action info msg
    label.getElementsByTagName('span')[0]?.remove();
  }
};

// handle hover
// mouse over
const handleMouseOver = (ev: MouseEvent) => {
  ev.stopPropagation();
  freshInboxGlobalVariables.isMouseOverHoverCard = true;
};

// mouse out
const handleMouseOut = () => {
  const { assistantBtnContainerId } = freshInboxGlobalVariables;

  setTimeout(() => {
    hideHoverCard({ parentElId: assistantBtnContainerId });
  }, 400);

  freshInboxGlobalVariables.isMouseOverHoverCard = false;
};

// create hover card elements
const createHoverCardElements = (): IHoverCardElements => {
  // create hoverCard elements
  // main container
  const hoverCard = document.createElement('div');
  const label = document.createElement('div');
  const btnContainer = document.createElement('div');
  // action buttons
  const whiteListEmailBtn = document.createElement('button');
  const unsubscribeBtn = document.createElement('button');
  const deleteAllMailsBtn = document.createElement('button');
  const unsubscribeAndDeleteAllMailsBtn = document.createElement('button');

  /// add classnames
  hoverCard.id = 'freshInbox-hoverCard';
  label.classList.add('hoverCard-label');
  btnContainer.id = 'hoverCard-btnContainer';

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

// show hover-card
type ShowHoverCardParams = {
  parentElId: string;
  email: string;
  name: string;
};

export const showHoverCard = async ({ parentElId, email, name }: ShowHoverCardParams) => {
  const {
    hoverCard,
    label,
    whiteListEmailBtn,
    unsubscribeBtn,
    deleteAllMailsBtn,
    unsubscribeAndDeleteAllMailsBtn,
  } = createHoverCardElements();

  // get parent el from id
  const parentEl = document.getElementById(parentElId);

  parentEl.appendChild(hoverCard);

  // add text to label
  label.innerHTML = `<p>Email Actions for <strong>${limitCharLength(name, 20)}</strong></p>`;

  // add tooltip to the label, show email on hover over sender name
  addTooltip(label.firstElementChild.firstElementChild as HTMLElement, email);

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

  if (isUnsubscribed) {
    // if already unsubscribed, show only deleteAllMails button
    // hide other buttons
    hideButtons([whiteListEmailBtn, unsubscribeBtn, unsubscribeAndDeleteAllMailsBtn]);
    // show info message
    actionInfoMsg(label, true);
  } else {
    // if not, show all three buttons
    // remove action info if present
    actionInfoMsg(label, false);
    showButtons([whiteListEmailBtn, unsubscribeBtn, unsubscribeAndDeleteAllMailsBtn]);

    // onClick listener to unsubscribe button
    unsubscribeBtn.addEventListener(
      'click',
      asyncHandler(async () => {
        hideHoverCard({ parentElId, forceClose: true });
        await handleUnsubscribeAction({ email });
      })
    );

    // onClick listener to unsubscribe and delete all mails button
    unsubscribeAndDeleteAllMailsBtn.addEventListener(
      'click',
      asyncHandler(async () => {
        hideHoverCard({ parentElId, forceClose: true });
        await handleUnsubscribeAndDeleteAction({
          email,
          onSuccess: async () => {
            // refresh the the table
            await refreshEmailsTable();
          },
        });
      })
    );

    // onClick listener to white list email button
    whiteListEmailBtn.addEventListener(
      'click',
      asyncHandler(async () => {
        hideHoverCard({ parentElId, forceClose: true });
        const isSuccess = await handleWhitelistAction({ email });
        if (isSuccess) {
          // if success, remove assistant btn from for this email
          const assistantBtnContainerId = freshInboxGlobalVariables.assistantBtnContainerId;
          const assistantBtnContainer = document.getElementById(assistantBtnContainerId);
          if (!assistantBtnContainer) return;
          const assistantBtn = assistantBtnContainer.getElementsByClassName('freshInbox-assistantBtn');

          // remove assistant btn for for this email
          if (assistantBtn.length > 0) {
            assistantBtn[0].remove();
          }
        }
      })
    );
  }

  // onClick listener to delete all mails button
  deleteAllMailsBtn.addEventListener(
    'click',
    asyncHandler(async () => {
      hideHoverCard({ parentElId, forceClose: true });
      await handleDeleteAllMailsAction({
        email,
        onSuccess: async () => {
          // refresh the the table
          await refreshEmailsTable();
        },
      });
    })
  );

  // show card
  hoverCard.style.display = 'flex';
  hoverCard.style.visibility = 'visible';
};

// hide hoverCard
type HideHoverCardParams = {
  parentElId: string;
  forceClose?: boolean;
};

export const hideHoverCard = ({ parentElId, forceClose }: HideHoverCardParams) => {
  // if forceClose is true, then close the hover card

  // if mouse is hovered over the card or assistant button then do nothing
  if (
    !forceClose &&
    (freshInboxGlobalVariables.isMouseOverHoverCard ||
      freshInboxGlobalVariables.isMouseOverFreshInboxAssistantBtn)
  )
    return;

  // get hover card el from id
  const hoverCard = document.getElementById('freshInbox-hoverCard');

  if (!hoverCard) return;

  // get parent el from id
  const parentEl = document.getElementById(parentElId);

  if (parentEl?.contains(hoverCard)) {
    // hide the card
    hoverCard.style.display = 'none';
    hoverCard.style.visibility = 'hidden';

    // remove hover card from parentEl
    parentEl.removeChild(hoverCard);
  }
};
