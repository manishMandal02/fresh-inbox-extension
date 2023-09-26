import {
  IHoverCardElements,
  hideHoverCard,
  initializeHoverCard,
  showHoverCard,
} from './view/unsubscribeHoverCard';
import { randomId } from './utils/randomId';
import { renderAuthModal } from './view/authModal';
import { EmailId, IMessageBody, IMessageEvent } from './content.types';
import { asyncMessageHandler } from './utils/asyncMessageHandler';
import { refreshEmailsTable } from './utils/refreshEmailsTable';
import { mailMagicSettingsBtn } from './view/mailMagicSettingsBtn';
import { getDateRangeFromNodes } from './utils/getDateRangeFromNodes';
import { getSelectedCategory } from './utils/getSelectedCategory';
import { geCurrentIdFromURL } from './utils/geCurrentIdFromURL';
import { showSettingsModal } from './view/settingsModal';

// types
// content script global variables
export interface MailMagicGlobalVariables {
  email: string;
  name: string;
  hoverCardElements: IHoverCardElements | null;
  assistantBtnContainerId: string;
  isMouseOverHoverCard: boolean;
  isMouseOverMailMagicAssistantBtn: boolean;
}

// set  global variable state
window.mailMagicGlobalVariables = {
  email: '',
  name: '',
  assistantBtnContainerId: '',
  hoverCardElements: null,
  isMouseOverHoverCard: false,
  isMouseOverMailMagicAssistantBtn: false,
};

//TODO: get the current selected category

// get all mails visible on page
const getAllMails = async () => {
  let allMailNodes: Element[] | [] = [];
  // get all mail nodes on current page in the table by email attribute
  allMailNodes = Array.from(document.querySelectorAll('tr>td>div:last-child>span>span[email]'));

  //TODO: get start and end dates as well (format:mm-dd-yyyy)

  if (allMailNodes.length < 1) {
    console.log('❌ No emails (nodes) found on this page.');
    return;
  }

  console.log('🚀 ~ file: index.ts:16 ~ getAllMails ~ allMailNodes:', allMailNodes.length);

  let newsletterEmails = [''];

  // get email and name from each mail node
  let allEmailsOnPage: EmailId[] = allMailNodes.map(mailNode => {
    if (mailNode.getAttribute('email')) {
      const email = mailNode.getAttribute('email');
      const idNode = mailNode
        .closest('td')
        .nextElementSibling.querySelector('span[data-legacy-last-message-id]');
      const id = idNode.getAttribute('data-legacy-last-message-id');
      return { email, id };
    } else {
      return null;
    }
  });

  // remove null/empty values
  allEmailsOnPage = allEmailsOnPage.filter(email => email);

  // date range
  const dateRange = getDateRangeFromNodes(allMailNodes);

  // get current folder (anchor ids in url like inbox, spam, all, etc.)
  const currentFolder = geCurrentIdFromURL();

  // get current selected category
  const selectedCategory = getSelectedCategory();

  const res = await chrome.runtime.sendMessage<IMessageBody>({
    event: IMessageEvent.GET_NEWSLETTER_EMAILS_ON_PAGE,
    dataOnPage: {
      category: selectedCategory || null,
      folder: currentFolder,
      emails: allEmailsOnPage,
      dateRange: dateRange,
    },
  });

  if (res) {
    newsletterEmails = res;
  }

  // do nothing if no newsletter emails found
  if (newsletterEmails.length < 1) {
    console.log('🙌 No newsletter emails found on this page.');
    return;
  }

  // loop through all mail nodes to embed assistant button
  for (const email of allMailNodes) {
    const emailAttr = email.getAttribute('email');

    console.log('🚀 ~ file: index.ts:107 ~ getAllMails ~ emailAttr:', emailAttr);

    const name = email.getAttribute('name');

    //* skips the iteration if the current email is not a newsletter email
    // assistant button won't be rendered
    if (!newsletterEmails.includes(emailAttr)) {
      console.log('🚀 ~ file: index.ts:112 ~ getAllMails ~ SKIP❌:', emailAttr);
      continue;
    }

    // append unsubscribe  button
    // container to add unsubscribe button
    const mailMagicAssistantBtnContainer = email.closest('div');

    const mailMagicAssistantBtn = document.createElement('span');
    mailMagicAssistantBtn.classList.add('mailMagic-assistant-btn');

    // append the button to container
    mailMagicAssistantBtnContainer.appendChild(mailMagicAssistantBtn);

    console.log(
      '🚀 ~ file: index.ts:128 ~ getAllMails ~ mailMagicAssistantBtnContainer:',
      mailMagicAssistantBtnContainer
    );

    // add onmouseover (on hover) event listener to unsubscribe button
    mailMagicAssistantBtn.addEventListener('click', (ev: MouseEvent) => {
      ev.stopPropagation();
      // plan something for this
    });
    // add onmouseover (on hover) event listener to unsubscribe button
    mailMagicAssistantBtn.addEventListener('mouseover', () => {
      mailMagicGlobalVariables.assistantBtnContainerId = randomId();
      mailMagicAssistantBtnContainer.id = mailMagicGlobalVariables.assistantBtnContainerId;
      //
      mailMagicGlobalVariables.isMouseOverMailMagicAssistantBtn = true;
      setTimeout(async () => {
        await showHoverCard({
          name,
          parentElId: mailMagicGlobalVariables.assistantBtnContainerId,
          email: emailAttr,
          hoverCardElements: mailMagicGlobalVariables.hoverCardElements,
        });
      }, 300);
    });

    mailMagicAssistantBtn.addEventListener('mouseout', () => {
      setTimeout(() => {
        hideHoverCard({
          parentElId: mailMagicGlobalVariables.assistantBtnContainerId,
          hoverCardElements: mailMagicGlobalVariables.hoverCardElements,
        });
      }, 800);
      mailMagicGlobalVariables.isMouseOverMailMagicAssistantBtn = false;
    });
  }
};

const embedMailMagicBtn = async () => {
  await getAllMails();
  window.mailMagicGlobalVariables.hoverCardElements = initializeHoverCard();
};

// run app
const startApp = async () => {
  // check for auth token (user access)
  const isTokenValid = await chrome.runtime.sendMessage({ event: IMessageEvent.Check_Auth_Token });

  console.log('🚀 ~ file: index.ts:125 ~ setTimeout ~ isTokenValid:', isTokenValid);
  // render mail magic status button (top button)
  mailMagicSettingsBtn();
  if (!isTokenValid) {
    // show auth modal to allow users to give access to gmail

    renderAuthModal({ embedMailMagicBtn });
  } else {
    embedMailMagicBtn();
  }
};

// TODO: a global error handler to catch any errors, (also add the chrome runtime error method)

//TODO: check if emails were loaded
// if-not: then wait for 500ms then check again (keep repeating)
// if-yes: then show the unsubscribe button

chrome.runtime.onMessage.addListener(
  asyncMessageHandler<IMessageBody, string | boolean>(async (request, sender) => {
    console.log(
      '🚀 ~ file: index.ts:130 ~ asyncMessageHandler<IMessageBody,string|boolean> ~ request:',
      request
    );

    switch (request.event) {
      case IMessageEvent.REFRESH_TABLE: {
        const isRefreshed = await refreshEmailsTable();

        console.log(
          '🚀 ~ file: index.ts:142 ~ asyncMessageHandler<IMessageBody,string|boolean> ~ isRefreshed:',
          isRefreshed
        );

        return isRefreshed;
      }
      default: {
        return 'Unknown Event';
      }
    }
  })
);

//TODO: Embed the settings button on all the url as the content script is only allowed on gmail's web app

//TODO: Embed/re-Embed assistant button when on inbox url: https://mail.google.com/mail/u/0/#inbox (get id from url, ex:inbox)
//urls to run on with ids: #inbox, #starred, #all, #spam
//TODO: and also when they see a email and come back to the email table

//TODO: check the chrome-sync-storage if app is enabled or not, better to do this in the background script on the very first call

// execute this script after 2.5s
setTimeout(async () => {
  // check if mail magic is enabled or not
  // const isEnabled = await chrome.storage.sync.get('isMailMagicEnabled');
  // run the app

  try {
    await startApp();
  } catch (err) {
    console.log('🚀 ~ file: index.ts:185 ~ setTimeout ~ err:', err);
  }
}, 2500);
