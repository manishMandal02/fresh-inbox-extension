import { getAllMailsOnPage } from '@src/pages/content/view/assistantButton/helper/getMailsOnPage';
import { geCurrentIdFromURL } from '../../utils/geCurrentIdFromURL';
import { getSelectedCategory } from '../../utils/getSelectedCategory';
import { IMessageBody, IMessageEvent } from '../../types/content.types';
import { hideHoverCard, showHoverCard } from './hoverCard/assistantHoverCard';
import { randomId } from '../../utils/randomId';
import { retryAtIntervals } from '../../utils/retryAtIntervals';
import { asyncHandler } from '../../utils/asyncHandler';
import { logger } from '../../utils/logger';

type HandleMouseOverParams = {
  ev: MouseEvent;
  assistantBtnContainer: HTMLDivElement;
  name: string;
  email: string;
};

// handle hover
// mouse over
const handleMouseOver = ({ ev, assistantBtnContainer, name, email }: HandleMouseOverParams) => {
  ev.stopPropagation();

  // if hover card is already shown, do nothing
  if (assistantBtnContainer.contains(document.getElementById('mailMagic-hoverCard'))) return;

  mailMagicGlobalVariables.assistantBtnContainerId = randomId();
  assistantBtnContainer.id = mailMagicGlobalVariables.assistantBtnContainerId;
  //
  mailMagicGlobalVariables.isMouseOverMailMagicAssistantBtn = true;
  setTimeout(
    asyncHandler(async () => {
      await showHoverCard({
        name,
        email,
        parentElId: mailMagicGlobalVariables.assistantBtnContainerId,
      });
    }),
    300
  );
};

//  mouse out
const handleMouseOut = () => {
  const { assistantBtnContainerId } = mailMagicGlobalVariables;

  setTimeout(() => {
    hideHoverCard({
      parentElId: assistantBtnContainerId,
    });
  }, 400);
  mailMagicGlobalVariables.isMouseOverMailMagicAssistantBtn = false;
};

// mail magic assistant button
const embedAssistantBtnLogic = async (): Promise<boolean> => {
  // get all the mails with ids on the page
  const { emails, dateRange, allMailNodes } = getAllMailsOnPage();

  if (emails.length < 1) return false;

  // get current folder (anchor ids in url like inbox, spam, all, etc.)
  const currentFolder = geCurrentIdFromURL();

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
    return false;
  }

  // loop through all mail nodes to embed assistant button
  for (const email of allMailNodes) {
    const emailAttr = email.getAttribute('email');

    const name = email.getAttribute('name');

    //* skips the iteration if the current email is not a newsletter email
    // assistant button won't be rendered
    if (!newsletterEmails.includes(emailAttr)) {
      continue;
    }

    // append unsubscribe  button
    // container to add unsubscribe button
    const assistantBtnContainer = email.closest('div');

    const assistantBtn = document.createElement('span');
    assistantBtn.classList.add('mailMagic-assistantBtn');

    // append the button to container
    assistantBtnContainer.appendChild(assistantBtn);

    //* add event listeners to assistant button
    // on click (currently do nothing, just stop bubbling of event)
    assistantBtn.addEventListener('click', (ev: MouseEvent) => {
      ev.stopPropagation();
    });

    // on hover over listener
    assistantBtn.addEventListener('mouseover', ev => {
      handleMouseOver({ ev, assistantBtnContainer, name, email: emailAttr });
    });

    // on hover out listener
    assistantBtn.addEventListener('mouseout', handleMouseOut);
  }
  return true;
};

// embed assistant button with retry logic
export const embedAssistantBtn = async () => {
  // retry to check if the emails are found on page or not
  // if not, then retry it for 3 times with 2 seconds interval
  await retryAtIntervals<boolean>({ retries: 3, interval: 2000, callback: embedAssistantBtnLogic });
};
