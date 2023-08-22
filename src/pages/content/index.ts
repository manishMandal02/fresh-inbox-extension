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
import { mailMagicStatusBtn } from './view/mailMagicStatusBtn';

// types
// content script global variables
export interface MailMagicGlobalVariables {
  email: string;
  name: string;
  isMouseOverMailMagicBtn: boolean;
  isMouseOverHoverCard: boolean;
  hoverCardElements: IHoverCardElements | null;
  mainBtnContainerId: string;
}

// interface IEmail {
//   email: string;
//   name: string;
//   isNewsLetter?: boolean;
// }

// get state from global

window.mailMagicGlobalVariables = {
  email: '',
  name: '',
  mainBtnContainerId: '',
  hoverCardElements: null,
  isMouseOverHoverCard: false,
  isMouseOverMailMagicBtn: false,
};
// get all mails visible on page
const getAllMails = () => {
  let allMailNodes: Element[] | [] = [];
  // get all mail nodes on current page in the table by email attribute
  allMailNodes = Array.from(document.querySelectorAll('tr>td>div:last-child>span>span[email]'));

  console.log('🚀 ~ file: index.ts:16 ~ getAllMails ~ allMailNodes:', allMailNodes.length);

  //TODO: get unsubscribed emails from storage don't icon based on that (to show delete icon or unsubscribe icon)

  if (allMailNodes.length > 0) {
    for (const email of allMailNodes) {
      const emailAttr = email.getAttribute('email');
      const name = email.getAttribute('name');

      //***** append unsubscribe  button
      // container to add unsubscribe button
      const mailMagicBtnContainer = email.closest('div');

      const mailMagicBtn = document.createElement('span');
      mailMagicBtn.classList.add('mailMagic-main-btn');

      // append the button to container
      mailMagicBtnContainer.appendChild(mailMagicBtn);

      // add onmouseover (on hover) event listener to unsubscribe button
      mailMagicBtn.addEventListener('click', (ev: MouseEvent) => {
        ev.stopPropagation();
        // plan something for this
      });
      // add onmouseover (on hover) event listener to unsubscribe button
      mailMagicBtn.addEventListener('mouseover', () => {
        mailMagicGlobalVariables.mainBtnContainerId = randomId();
        mailMagicBtnContainer.id = mailMagicGlobalVariables.mainBtnContainerId;
        //
        mailMagicGlobalVariables.isMouseOverMailMagicBtn = true;
        setTimeout(() => {
          showHoverCard({
            name,
            parentElId: mailMagicGlobalVariables.mainBtnContainerId,
            email: emailAttr,
            hoverCardElements: mailMagicGlobalVariables.hoverCardElements,
          });
        }, 300);
      });

      mailMagicBtn.addEventListener('mouseout', () => {
        setTimeout(() => {
          hideHoverCard({
            parentElId: mailMagicGlobalVariables.mainBtnContainerId,
            hoverCardElements: mailMagicGlobalVariables.hoverCardElements,
          });
        }, 800);
        mailMagicGlobalVariables.isMouseOverMailMagicBtn = false;
      });
    }
  } else {
    console.log('❌ No emails found on page');
  }
};

const embedMailMagicBtn = () => {
  getAllMails();
  window.mailMagicGlobalVariables.hoverCardElements = initializeHoverCard();
};

// run app
const startApp = async () => {
  // check for auth token (user access)
  const isTokenValid = await chrome.runtime.sendMessage({ event: IMessageEvent.Check_Auth_Token });

  console.log('🚀 ~ file: index.ts:125 ~ setTimeout ~ isTokenValid:', isTokenValid);
  // render mail magic status button (top button)
  mailMagicStatusBtn();
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
  await startApp();
}, 2500);
