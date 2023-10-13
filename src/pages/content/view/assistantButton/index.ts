import { getAllMailsOnPage } from '@src/pages/content/view/assistantButton/helper/getMailsOnPage';
import { getAnchorIdFromURL } from '../../utils/getAnchorIdFromURL';
import { getSelectedCategory } from '../../utils/getSelectedCategory';
import { IMessageBody, IMessageEvent } from '../../types/content.types';
import { hideHoverCard, showHoverCard } from './hoverCard/assistantHoverCard';
import { randomId } from '../../utils/randomId';
import { retryAtIntervals } from '../../utils/retryAtIntervals';
import { asyncHandler } from '../../utils/asyncHandler';
import { logger } from '../../utils/logger';
import wait from '../../utils/wait';

type HandleMouseOverParams = {
  ev?: MouseEvent;
  assistantBtnContainer: Element;
  name: string;
  email: string;
};

// handle hover
// mouse over
const handleMouseOver = async ({ ev, assistantBtnContainer, name, email }: HandleMouseOverParams) => {
  ev?.stopPropagation();

  // if hover card is already shown, do nothing
  if (assistantBtnContainer.contains(document.getElementById('freshInbox-hoverCard'))) return;

  freshInboxGlobalVariables.assistantBtnContainerId = randomId();
  assistantBtnContainer.id = freshInboxGlobalVariables.assistantBtnContainerId;
  //
  freshInboxGlobalVariables.isMouseOverFreshInboxAssistantBtn = true;

  await wait(200);

  await showHoverCard({
    name,
    email,
    parentElId: freshInboxGlobalVariables.assistantBtnContainerId,
  });
};

//  mouse out
const handleMouseOut = () => {
  const { assistantBtnContainerId } = freshInboxGlobalVariables;

  setTimeout(() => {
    hideHoverCard({
      parentElId: assistantBtnContainerId,
    });
  }, 400);
  freshInboxGlobalVariables.isMouseOverFreshInboxAssistantBtn = false;
};

type InitializeAssistantBtnParams = {
  assistantBtnContainer: Element;
  name: string;
  email: string;
  isSingle?: boolean;
};

const initializeAssistantBtn = ({
  assistantBtnContainer,
  email,
  name,
  isSingle,
}: InitializeAssistantBtnParams) => {
  const assistantBtn = document.createElement('span');

  assistantBtn.classList.add('freshInbox-assistantBtn');

  if (isSingle) {
    assistantBtn.classList.add('singleEmail');
  }

  // append the button to container
  assistantBtnContainer.appendChild(assistantBtn);

  //* add event listeners to assistant button
  // on click (currently do nothing, just stop bubbling of event)
  assistantBtn.addEventListener('click', (ev: MouseEvent) => {
    ev.stopPropagation();
  });

  // on hover over listener
  assistantBtn.addEventListener(
    'mouseover',
    asyncHandler(async () => {
      await handleMouseOver({ ev: null, name, email, assistantBtnContainer });
      // add single class to the button if it is a single email (to get correct positioning)
      if (isSingle) {
        const hoveredCard = document.getElementById('freshInbox-hoverCard');

        if (!hoveredCard) return;
        hoveredCard.classList.add('singleEmail');
      }
    })
  );

  // on hover out listener
  assistantBtn.addEventListener('mouseout', handleMouseOut);
};

// fresh inbox assistant button
const embedAssistantBtnLogic = async (isURLChanged = false): Promise<boolean> => {
  // remove the previous assistant buttons if the url changed
  if (isURLChanged) {
    const assistantsButtons = document.getElementsByClassName('freshInbox-assistantBtn');

    // while loop to check if the buttons are removed or not
    // as the for loop below didn't remove all the buttons in one go
    while (assistantsButtons.length > 0) {
      // remove all the buttons
      for (const btn of assistantsButtons) {
        btn.remove();
      }
    }
  }
  // get all the mails with ids on the page
  const { emails, dateRange, allMailNodes } = getAllMailsOnPage();

  if (emails.length < 1) return false;

  // get current folder (anchor ids in url like inbox, spam, all, etc.)
  const currentFolder = getAnchorIdFromURL();

  // get current selected category
  const selectedCategory = getSelectedCategory();

  // newsletter emails
  let newsletterEmails = [''];

  const res = await chrome.runtime.sendMessage<IMessageBody>({
    event: IMessageEvent.GET_NEWSLETTER_EMAILS_ON_PAGE,
    dataOnPage: {
      emails,
      dateRange,
      category: selectedCategory || null,
      folder: currentFolder,
    },
  });

  if (res) {
    // store the  emails from response
    newsletterEmails = res;
  }

  console.log('🚀 ~ file: index.ts:101 ~ embedAssistantBtnLogic ~ newsletterEmails:', newsletterEmails);

  // do nothing if no newsletter emails found
  if (newsletterEmails.length < 1) {
    logger.info(
      '🙌 No newsletter emails found on this page.',
      'content/view/assistantButton/index.ts:90 ~ embedAssistantBtnLogic()'
    );
    return true;
  }

  // loop through all mail nodes to embed assistant button
  for (const emailNode of allMailNodes) {
    const email = emailNode.getAttribute('email');

    const name = emailNode.getAttribute('name');

    //* skips the iteration if the current email is not a newsletter email
    // assistant button won't be rendered
    if (!newsletterEmails.includes(email)) {
      continue;
    }

    // embed assistant  button
    // container to add unsubscribe button
    const assistantBtnContainer = emailNode.closest('div');

    initializeAssistantBtn({ name, email, assistantBtnContainer });
  }
  return true;
};

// embed single assistant btn (used when single email is opened)
export const embedSingleAssistantBtn = async () => {
  // get print email button
  const printEmailBtn = document.querySelector('button[aria-label="Print all"]');

  console.log('🚀 ~ file: index.ts:183 ~ embedSingleAssistantBtn ~ printEmailBtn:', printEmailBtn);

  // get the parent container of print email button to embed assistant button
  const assistantBtnContainer = printEmailBtn.closest('div').parentElement;

  if (!assistantBtnContainer) return;

  // position parent container relative, so assistant button can be positioned absolute to it
  (assistantBtnContainer as HTMLDivElement).style.position = 'relative';

  // get email node
  const emailNode = document.querySelector('tbody > tr > td span[email] > span')?.parentElement;

  if (!emailNode) return;

  // get email id of current opened email
  const email = emailNode.getAttribute('email');
  // get name
  const name = emailNode.getAttribute('name');

  // create and initialize all the event listeners
  initializeAssistantBtn({ assistantBtnContainer, name, email, isSingle: true });
};

// embed assistant button with retry logic
export const embedAssistantBtn = async (isURLChanged = false) => {
  // retry to check if the emails are found on page or not
  // if not, then retry it for 3 times with 2 seconds interval
  await retryAtIntervals<boolean>({
    retries: 3,
    interval: 2000,
    callback: async () => await embedAssistantBtnLogic(isURLChanged),
  });
};
