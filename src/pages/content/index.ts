import {
  IHoverCardElements,
  hideHoverCard,
  initializeHoverCard,
  showHoverCard,
} from './utils/unsubscribeHoverCard';
import { randomId } from './utils/randomId';

// types
// content script global variables
export interface MailPurgeGlobalVariables {
  email: string;
  name: string;
  isMouseOverMailPurgeBtn: boolean;
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

window.mailPurgeGlobalVariables = {
  email: '',
  name: '',
  mainBtnContainerId: '',
  hoverCardElements: null,
  isMouseOverHoverCard: false,
  isMouseOverMailPurgeBtn: false,
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
      const mailPurgeBtnContainer = email.closest('div');

      const mailPurgeBtn = document.createElement('button');
      mailPurgeBtn.classList.add('unsubscribe-btn');

      // append the button to container
      mailPurgeBtnContainer.appendChild(mailPurgeBtn);

      // add onmouseover (on hover) event listener to unsubscribe button
      mailPurgeBtn.addEventListener('click', (ev: MouseEvent) => {
        ev.stopPropagation();
        // plan something for this
      });
      // add onmouseover (on hover) event listener to unsubscribe button
      mailPurgeBtn.addEventListener('mouseover', () => {
        mailPurgeGlobalVariables.mainBtnContainerId = randomId();
        mailPurgeBtnContainer.id = mailPurgeGlobalVariables.mainBtnContainerId;
        //
        mailPurgeGlobalVariables.isMouseOverMailPurgeBtn = true;
        setTimeout(() => {
          showHoverCard({
            name,
            parentElId: mailPurgeGlobalVariables.mainBtnContainerId,
            email: emailAttr,
            hoverCardElements: mailPurgeGlobalVariables.hoverCardElements,
          });
        }, 300);
      });

      mailPurgeBtn.addEventListener('mouseout', () => {
        setTimeout(() => {
          hideHoverCard({
            parentElId: mailPurgeGlobalVariables.mainBtnContainerId,
            hoverCardElements: mailPurgeGlobalVariables.hoverCardElements,
          });
        }, 800);
        mailPurgeGlobalVariables.isMouseOverMailPurgeBtn = false;
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
  window.mailPurgeGlobalVariables.hoverCardElements = initializeHoverCard();
}, 2500);
