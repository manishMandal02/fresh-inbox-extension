/**
 * @description
 * Chrome extensions don't support modules in content scripts.
 */

import {
  IHoverCardElements,
  hideHoverCard,
  initializeHoverCard,
  showHoverCard,
} from './view/unsubscribeHoverCard';
import { randomId } from './utils/randomId';
import { renderAuthModal } from './view/authModal';
import { IMessageBody, IMessageEvent } from './content.types';
import { asyncMessageHandler } from './utils/asyncMessageHandler';
import { refreshEmailsTable } from './utils/refreshEmailsTable';
import { mailMagicSettingsBtn } from './view/mailMagicSettingsBtn';
import { storageKeys } from './constants/app.constants';
import { showSettingsModal } from './view/settingsModal';
import { showLoadingSnackbar, showSnackbar } from './view/elements/snackbar';

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

// get all mails visible on page
const getAllMails = async () => {
  let allMailNodes: Element[] | [] = [];
  // get all mail nodes on current page in the table by email attribute
  allMailNodes = Array.from(document.querySelectorAll('tr>td>div:last-child>span>span[email]'));

  console.log('🚀 ~ file: index.ts:16 ~ getAllMails ~ allMailNodes:', allMailNodes.length);

  // TODO: don't show assistant button for white listed emails
  let whiteListedEmails: null | string[] = null;
  // get white listed emails from extension storage
  const syncStorageData = await chrome.storage.sync.get(storageKeys.WHITELISTED_EMAILS);
  if (
    syncStorageData[storageKeys.WHITELISTED_EMAILS] &&
    syncStorageData[storageKeys.WHITELISTED_EMAILS].length > 0
  ) {
    whiteListedEmails = syncStorageData[storageKeys.WHITELISTED_EMAILS];
  }

  if (allMailNodes.length > 0) {
    for (const email of allMailNodes) {
      const emailAttr = email.getAttribute('email');
      const name = email.getAttribute('name');

      //* skips the iteration if the current email is white listed
      // assistant button won't be rendered
      if (whiteListedEmails && whiteListedEmails.includes(emailAttr)) {
        continue;
      }

      //***** append unsubscribe  button
      // container to add unsubscribe button
      const mailMagicAssistantBtnContainer = email.closest('div');

      const mailMagicAssistantBtn = document.createElement('span');
      mailMagicAssistantBtn.classList.add('mailMagic-assistant-btn');

      // append the button to container
      mailMagicAssistantBtnContainer.appendChild(mailMagicAssistantBtn);

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
  } else {
    console.log('❌ No emails found on page');
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

//TODO: start/restart app logic when on inbox url: https://mail.google.com/mail/u/0/#inbox (get id from url, ex:inbox)
//TODO: and also when they see a email and come back to the email table

// execute this script after 2.5s
setTimeout(async () => {
  // check if mail magic is enabled or not
  // const isEnabled = await chrome.storage.sync.get('isMailMagicEnabled');
  // run the app

  try {
    await startApp();

    //TODO: testing- delete this later
    showSettingsModal();
  } catch (err) {
    console.log('🚀 ~ file: index.ts:185 ~ setTimeout ~ err:', err);
  }
}, 1500);
