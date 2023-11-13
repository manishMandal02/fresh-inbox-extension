import { getAnchorIdFromURL } from './helper/getAnchorIdFromURL';
import { getSelectedCategory } from './helper/getSelectedCategory';
import { IMessageBody, IMessageEvent } from '../../types/content.types';
import { hideHoverCard, showHoverCard } from './hoverCard/assistantHoverCard';
import { randomId } from '../../utils/randomId';
import { retryAtIntervals } from '../../utils/retryAtIntervals';
import { asyncHandler } from '../../utils/asyncHandler';
import { logger } from '../../utils/logger';
import wait from '../../utils/wait';
import { isSupportedURL } from './helper/isSupportedURL';
import { getOpenedContainerType } from './helper/getOpenedContainerType';
import { getAllMailsOnPage } from './helper/getMailsOnPage';

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

  await wait(200);

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
  }, 400);
  freshInboxGlobalVariables.isMouseOverFreshInboxAssistantBtn = false;
};

type InitializeAssistantBtnParams = {
  assistantBtnContainer: Element;
  name: string;
  email: string;
  isSingleEmail?: boolean;
};

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

// fresh inbox assistant button
const embedAssistantBtnLogic = async (isReEmbedding = false): Promise<boolean> => {
  // remove the previous assistant buttons if the url changed
  if (isReEmbedding) {
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
    console.log('🚀 ~ file: index.ts:165 ~ embedAssistantBtnLogic ~ name:', name);

    // embed assistant  button
    // container to add unsubscribe button
    const assistantBtnContainer = emailNode.closest('div');

    console.log(
      '🚀 ~ file: index.ts:173 ~ embedAssistantBtnLogic ~ assistantBtnContainer:',
      assistantBtnContainer
    );

    initializeAssistantBtn({ name, email, assistantBtnContainer });
  }
  return true;
};

// embed single assistant btn (used when single email is opened)
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
export const embedAssistantBtn = async (isReEmbedding = false) => {
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
    },
  });

  console.log('🚀 ~ file: index.ts:210 ~ embedAssistantBtn ~ containerType:', containerType);

  if (!containerType) {
    // not a supported container type
    logger.info('Not supported container type');
    return;
  }
  // TODO: also support search links
  // check if current url is supported && current tab/page is inbox container
  // supported url/labels (inbox, starred, all, spam)
  if (isSupportedURL() && containerType === 'inbox') {
    // re-embed the assistant button
    // this is a supported url

    // check if the assistant button is already embedded
    const assistantBtn = document.getElementsByClassName('freshInbox-assistantBtn');

    // check if assistant buttons is already present
    if (assistantBtn && assistantBtn.length > 0) {
      // if present, remove all buttons
      for (const btn of assistantBtn) {
        btn.remove();
      }
    }

    // retry to check if the emails are found on page or not
    // if not, then retry it for 3 times with 2 seconds interval
    await retryAtIntervals<boolean>({
      retries: 3,
      interval: 2000,
      callback: async () => await embedAssistantBtnLogic(isReEmbedding),
    });

    return;
  }

  if (containerType === 'singleEmail') {
    // this is a single email container

    // embed the assistant button
    embedSingleAssistantBtn();
  }
};
