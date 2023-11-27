import { getAnchorIdFromURL } from './helper/getAnchorIdFromURL';
import { getSelectedCategory } from './helper/getSelectedCategory';
import { hideHoverCard, showHoverCard } from './hoverCard/assistantHoverCard';
import { randomId } from '../../utils/randomId';
import { retryAtIntervals } from '../../utils/retryAtIntervals';
import { asyncHandler } from '../../utils/asyncHandler';
import { logger } from '../../utils/logger';
import wait from '../../utils/wait';
import { isSupportedURL } from './helper/isSupportedURL';
import { getOpenedContainerType } from './helper/getOpenedContainerType';
import { getAllMailsOnPage } from './helper/getMailsOnPage';

import FreshInboxIcon from './../../assets/app-icon-128.png';
import { identifyOnPageNewsletterEmails } from './helper/identifyOnPageNewsletterEmails';

type HandleMouseOverParams = {
  ev?: MouseEvent;
  assistantBtnContainer: Element;
  name: string;
  email: string;
  isSingleEmail?: boolean;
};

// hover: mouse over
const handleMouseOver = async ({
  ev,
  assistantBtnContainer,
  name,
  email,
  isSingleEmail,
}: HandleMouseOverParams) => {
  ev?.stopPropagation();

  // set global variable
  freshInboxGlobalVariables.isMouseOverFreshInboxAssistantBtn = true;

  // if hover card is already shown, do nothing
  if (assistantBtnContainer.contains(document.getElementById('freshInbox-hoverCard'))) return;

  freshInboxGlobalVariables.assistantBtnContainerId = randomId();
  assistantBtnContainer.id = freshInboxGlobalVariables.assistantBtnContainerId;

  await wait(100);

  await showHoverCard({
    name,
    email,
    isSingleEmail,
    parentElId: freshInboxGlobalVariables.assistantBtnContainerId,
  });
};

// hover:  mouse out
const handleMouseOut = () => {
  const { assistantBtnContainerId } = freshInboxGlobalVariables;

  setTimeout(() => {
    hideHoverCard({
      parentElId: assistantBtnContainerId,
    });
  }, 250);
  freshInboxGlobalVariables.isMouseOverFreshInboxAssistantBtn = false;
};

type InitializeAssistantBtnParams = {
  assistantBtnContainer: Element;
  name: string;
  email: string;
  isSingleEmail?: boolean;
};

// render logic for assistant button
const initializeAssistantBtn = ({
  assistantBtnContainer,
  email,
  name,
  isSingleEmail,
}: InitializeAssistantBtnParams) => {
  const assistantBtn = document.createElement('span');

  assistantBtn.classList.add('freshInbox-assistantBtn');

  if (isSingleEmail) {
    assistantBtn.classList.add('singleEmailAssistantBtn');
  }

  // add icon to assistant button

  assistantBtn.style.backgroundImage = `url(${FreshInboxIcon})`;

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
      await handleMouseOver({ ev: null, name, email, assistantBtnContainer, isSingleEmail });
    })
  );

  // on hover out listener
  assistantBtn.addEventListener('mouseout', handleMouseOut);
};

// render assistant buttons on emails table
const embedAssistantBtnLogic = async (): Promise<boolean> => {
  // wait for 600ms
  await wait(600);
  // get all the mails with ids on the page
  const { emails, dateRange, allMailNodes } = getAllMailsOnPage();

  if (emails.length < 1) return false;

  // get current folder (anchor ids in url like inbox, spam, all, etc.)
  const currentFolder = getAnchorIdFromURL();

  // get current selected category
  const selectedCategory = getSelectedCategory();

  // newsletter emails
  let newsletterEmails = [''];

  // identify on page newsletter emails

  const res = await identifyOnPageNewsletterEmails({
    emails,
    dateRange,
    folder: currentFolder,
    category: selectedCategory || null,
  });

  if (res) {
    // store the  emails from response
    newsletterEmails = res;
  }

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

    // container to add unsubscribe button
    const assistantBtnContainer = emailNode.closest('div');

    // skips the iteration
    // if the current email is not identified as a newsletter email or
    // if assistant button is already embedded, if yes do nothing
    if (
      !newsletterEmails.includes(email) ||
      assistantBtnContainer.querySelector('span.freshInbox-assistantBtn')!!
    ) {
      // assistant button won't be rendered
      continue;
    }

    // embed assistant button
    initializeAssistantBtn({ name, email, assistantBtnContainer });
  }
  return true;
};

// embed single assistant btn (used when single email view is opened)
export const embedSingleAssistantBtn = async () => {
  // get print email button
  const printEmailBtn = document.querySelector('button[aria-label="Print all"]');

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
  initializeAssistantBtn({ assistantBtnContainer, name, email, isSingleEmail: true });
};

// embed assistant button with retry logic
export const embedAssistantBtn = async () => {
  // check if current url is supported &&
  // supported url/labels (inbox, starred, all, spam, search)
  if (!isSupportedURL()) return;
  //
  let containerType = null;

  // check for container type & embed assistant button accordingly (single or inbox)
  // with a retry mechanism to try if container type not found the first time
  await retryAtIntervals<boolean>({
    retries: 3,
    interval: 2000,
    callback: async () => {
      const currentContainer = await getOpenedContainerType();
      if (currentContainer) {
        containerType = currentContainer;
        return true;
      }
      return false;
    },
  });

  if (!containerType) {
    // not a supported container type
    logger.info('Not supported container type');
    return;
  }

  if (containerType === 'inbox') {
    // re-embed the assistant button

    // retry to check if the emails are found on page or not
    // if not, then retry it for 3 times with 2 seconds interval
    await retryAtIntervals<boolean>({
      retries: 3,
      interval: 2000,
      callback: async () => await embedAssistantBtnLogic(),
    });

    return;
  }

  if (containerType === 'singleEmail') {
    // this is a single email container

    // embed the assistant button
    embedSingleAssistantBtn();
  }
};
