import {
  IHoverCardElements,
  hideHoverCard,
  initializeHoverCard,
  showHoverCard,
} from './unsubscribeHoverCard';

console.log('🔥 content script loaded: start');

export interface MailPurgeGlobalState {
  email: string;
  name: string;
  isMouseOverMailPurgeBtn: boolean;
  isMouseOverHoverCard: boolean;
  hoverCardElements: IHoverCardElements;
  mainBtnContainer: HTMLDivElement;
}

// content script global variables

// hoverCard elements
let hoverCardElements: IHoverCardElements | null = null;

// types
interface IEmail {
  email: string;
  name: string;
  isNewsLetter?: boolean;
}

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

      //************* append unsubscribe  button ********
      // container to add unsubscribe button
      const btnContainer = email.closest('div');
      const mailPurgeBtn = document.createElement('button');
      mailPurgeBtn.classList.add('unsubscribe-btn');

      // append the button to container
      btnContainer.appendChild(mailPurgeBtn);

      // add onmouseover (on hover) event listener to unsubscribe button
      mailPurgeBtn.addEventListener('click', (ev: MouseEvent) => {
        ev.stopPropagation();
        // plan something for this
      });
      // add onmouseover (on hover) event listener to unsubscribe button
      mailPurgeBtn.addEventListener('mouseover', (ev: MouseEvent) => {
        console.log('🚀 ~ file: index.ts:47 ~ mailPurgeBtn.addEventListener ~ mouse over:');
        //
        (window as any).mailPurge = { ...(window as any).mailPurge, isMouseOverMailPurgeBtn: true };
        setTimeout(() => {
          showHoverCard({ parentEl: btnContainer, email: emailAttr, name, hoverCardElements });
        }, 250);
      });

      mailPurgeBtn.addEventListener('mouseout', (ev: MouseEvent) => {
        console.log('🚀 ~ file: index.ts:47 ~ mailPurgeBtn.addEventListener ~ mouse out:');
        (window as any).mailPurge = { ...(window as any).mailPurge, isMouseOverMailPurgeBtn: false };

        setTimeout(() => {
          const isMouseOverHoverCard = (window as any).mailPurge.isMouseOverHoverCard || false;
          //@ts-ignore
          console.log('🔥 testing window variables', window.mailPurge);
          if (!isMouseOverHoverCard) {
            hideHoverCard({ parentEl: btnContainer, hoverCardElements });
          }
        }, 300);
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
  hoverCardElements = initializeHoverCard();
}, 2500);
console.log('🔥 content script loaded: end');
