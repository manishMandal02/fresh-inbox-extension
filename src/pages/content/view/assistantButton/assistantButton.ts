import { getAllMailsOnPage } from '@src/pages/content/view/assistantButton/helper/getMailsOnPage';
import { geCurrentIdFromURL } from '../../utils/geCurrentIdFromURL';
import { getSelectedCategory } from '../../utils/getSelectedCategory';
import { IMessageBody, IMessageEvent } from '../../content.types';
import { hideHoverCard, initializeHoverCard, showHoverCard } from '../unsubscribeHoverCard';
import { randomId } from '../../utils/randomId';

type HandleMouseOverParams = {
  ev: MouseEvent;
  assistantBtnContainer: HTMLDivElement;
  name: string;
  email: string;
};

// handle on hover
// mouse over
const handleMouseOver = ({ ev, assistantBtnContainer, name, email }: HandleMouseOverParams) => {
  ev.stopPropagation();
  mailMagicGlobalVariables.assistantBtnContainerId = randomId();
  assistantBtnContainer.id = mailMagicGlobalVariables.assistantBtnContainerId;
  //
  mailMagicGlobalVariables.isMouseOverMailMagicAssistantBtn = true;
  setTimeout(() => {
    (async () => {
      await showHoverCard({
        name,
        email,
        parentElId: mailMagicGlobalVariables.assistantBtnContainerId,
        hoverCardElements: mailMagicGlobalVariables.hoverCardElements,
      });
    })();
  }, 200);
};

//  mouse out
const handleMouseOut = () => {
  setTimeout(() => {
    hideHoverCard({
      parentElId: mailMagicGlobalVariables.assistantBtnContainerId,
      hoverCardElements: mailMagicGlobalVariables.hoverCardElements,
    });
  }, 500);
  mailMagicGlobalVariables.isMouseOverMailMagicAssistantBtn = false;
};

// mail magic assistant button
export const embedAssistantBtn = async () => {
  // get all the mails with ids on the page
  const { emails, dateRange, allMailNodes } = getAllMailsOnPage();

  if (emails.length < 1) return;

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
  // do nothing if no newsletter emails found
  if (newsletterEmails.length < 1) {
    console.log('🙌 No newsletter emails found on this page.');
    return;
  }

  if (res) {
    newsletterEmails = res;
  }

  // loop through all mail nodes to embed assistant button
  for (const email of allMailNodes) {
    const emailAttr = email.getAttribute('email');

    const name = email.getAttribute('name');

    //* skips the iteration if the current email is not a newsletter email
    // assistant button won't be rendered
    if (!newsletterEmails.includes(emailAttr)) {
      console.log('🚀 ~ file: index.ts:112 ~ getAllMails ~ SKIP ⏩:', emailAttr);
      continue;
    }

    // append unsubscribe  button
    // container to add unsubscribe button
    const assistantBtnContainer = email.closest('div');

    const assistantBtn = document.createElement('span');
    assistantBtn.classList.add('mailMagic-assistant-btn');

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

    // initialize hover card elements
    window.mailMagicGlobalVariables.hoverCardElements = initializeHoverCard();

    // on hover out listener
    assistantBtn.addEventListener('mouseout', handleMouseOut);
  }
};
