/**
 * @description
 * Chrome extensions don't support modules in content scripts.
 */
import('./components');

import {
  IHoverCardElements,
  hideHoverCard,
  initializeHoverCard,
  showHoverCard,
} from './utils/unsubscribeHoverCard';
import { randomId } from './utils/randomId';

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

  if (allMailNodes.length > 0) {
    for (const email of allMailNodes) {
      const emailAttr = email.getAttribute('email');
      const name = email.getAttribute('name');

      //***** append unsubscribe  button
      // container to add unsubscribe button
      const mailMagicBtnContainer = email.closest('div');

      const mailMagicBtn = document.createElement('button');
      mailMagicBtn.classList.add('unsubscribe-btn');

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

// check if emails were loaded
// if-not: then wait for 500ms then check again (keep repeating)
// if-yes: then show the unsubscribe button

setTimeout(() => {
  getAllMails();
  window.mailMagicGlobalVariables.hoverCardElements = initializeHoverCard();
}, 2500);
