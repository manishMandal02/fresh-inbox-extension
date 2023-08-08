console.log('🔥 content script loaded: start');

// types
interface IEmail {
  email: string;
  name: string;
  isNewsLetter?: boolean;
}

// get all mails visible on page
const getAllMails = () => {
  let allEmails: IEmail[] = [];
  let allMailNodes: Element[] | [] = [];
  // get all mail nodes on current page in the table by email attribute
  allMailNodes = Array.from(document.querySelectorAll('tr>td>div:last-child>span>span[email]'));

  if (allMailNodes.length > 0) {
    for (const email of allMailNodes) {
      const emailAttr = email.getAttribute('email');
      const name = email.getAttribute('name');

      //************* append unsubscribe  button ********
      // container to add unsubscribe button
      const btnContainer = email.closest('div');
      const unsubscribeBtn = document.createElement('button');
      unsubscribeBtn.classList.add('unsubscribe-btn');

      // append the button to container
      btnContainer.appendChild(unsubscribeBtn);

      // add click event listener to unsubscribe button
      unsubscribeBtn.addEventListener('click', (ev: MouseEvent) => {
        ev.stopPropagation();

        console.log('🚀 ~ file: index.ts:35 ~ unsubscribeBtn.onClick listener ~ email:', emailAttr);
      });

      console.log('🚀 ~ file: app.tsx:34 ~ getAllMails ~ email:', email);

      allEmails.push({
        email: emailAttr,
        name,
      });
    }
  } else {
    console.log('❌ No emails found on page');
  }

  return allEmails;

  //   if (allMailNodes.length < 1) {
  //     allMailNodes = Array.from(
  //       document.querySelectorAll('tr>td>div:first-child>span>span[data-hovercard-id]:last-child')
  //     );

  //     if (allMailNodes.length > 0) {
  //       for (const email of allMailNodes) {
  //         const emailAttr = email.getAttribute('data-hovercard-id');
  //         const name = email.innerHTML;

  //         allEmails.push({
  //           email: emailAttr,
  //           name,
  //         });
  //       }
  //     } else {
  //     }
  //   }
};

// check if emails were loaded
// if-not: then wait for 500ms then check again (keep repeating)
// if-yes: then show the unsubscribe button

setTimeout(() => {
  const allMails = getAllMails();

  console.table(allMails);
}, 2500);
console.log('🔥 content script loaded: end');
