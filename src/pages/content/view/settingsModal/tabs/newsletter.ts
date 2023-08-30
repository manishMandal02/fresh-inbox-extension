import {
  handleUnsubscribe,
  handleDeleteAllMails,
  handleUnsubscribeAndDeleteAllMails,
} from '@src/pages/content/utils/emailActions';
import { storageKeys } from '@src/pages/content/constants/app.constants';

import { showConfirmModal } from '../../elements/confirmModal';
import { addTooltip, removeTooltip } from '../../elements/tooltip';
import { randomId } from '@src/pages/content/utils/randomId';

type NewsletterData = {
  email: string;
};

// render table
const renderTable = async (data: NewsletterData[]) => {
  // get table
  const tableEl = document.getElementById('newsletterTab-table');
  if (!tableEl) return;

  // set num of newsletters (emails) found
  const numOfNewsletterEmails = document.getElementById('newsletterTab-numNewsletterEmails');
  numOfNewsletterEmails.innerHTML = `${data.length}`;

  let newsletterEmails = data;

  // get unsubscribed emails from chrome storage
  const syncStorageData = await chrome.storage.sync.get(storageKeys.UNSUBSCRIBED_EMAILS);
  const unsubscribedEmails = syncStorageData[storageKeys.UNSUBSCRIBED_EMAILS] || [];

  // check if email is already unsubscribed
  if (unsubscribedEmails.length > 0) {
    // filter emails that are already unsubscribed
    newsletterEmails = newsletterEmails.filter(email => {
      return !unsubscribedEmails.includes(email.email);
    });
  }

  console.log('🚀 ~ file: newsletter.ts:28 ~ renderTable ~ newsletterEmails:', newsletterEmails);
  // loop over emails data to render table rows
  for (const item of newsletterEmails) {
    const email = item.email;

    console.log('🚀 ~ file: newsletter.ts:44 ~ renderTable ~ email:', email);

    // table row
    const tableRow = document.createElement('tr');
    // unique id for each row
    const rowId = randomId();

    // map over data
    let tableRowData = `
                <td>
                    <span>${email}</span>
                    <div>
                    <button id='newsletterTab-actionBtn-unsubscribe-${rowId}'>❌</button>
                    <button id='newsletterTab-actionBtn-deleteAllMails-${rowId}'>🗑️</button>
                    <button id='newsletterTab-actionBtn-unsubscribeAndDeleteAllMails-${rowId}'>❌ + 🗑️</button>
                    </div>
                </td>
        `;

    // add data to row
    tableRow.innerHTML = tableRowData;

    // add row to table
    tableEl.appendChild(tableRow);

    //* add event listener to all the action buttons
    // get button elements
    const unsubscribeBtn = document.getElementById(`newsletterTab-actionBtn-unsubscribe-${rowId}`);
    const deleteAllMails = document.getElementById(`newsletterTab-actionBtn-deleteAllMails-${rowId}`);
    const unsubscribeAndDeleteAllMailsBtn = document.getElementById(
      `newsletterTab-actionBtn-unsubscribeAndDeleteAllMails-${rowId}`
    );

    if (!unsubscribeBtn || !deleteAllMails || !unsubscribeAndDeleteAllMailsBtn) return;

    unsubscribeBtn.addEventListener('click', async ev => {
      // set global variable state
      mailMagicGlobalVariables.email = email;
      //TODO: get name
      mailMagicGlobalVariables.name = '';
      handleUnsubscribe();
    });

    deleteAllMails.addEventListener('click', async ev => {
      ev.stopPropagation();

      // set global variable state
      mailMagicGlobalVariables.email = email;

      showConfirmModal({
        msg: 'Are you sure you want to delete all mails  from',
        email,
        onConfirmClick: handleDeleteAllMails,
      });
    });

    unsubscribeAndDeleteAllMailsBtn.addEventListener('click', async ev => {
      ev.stopPropagation();

      // set global variable state
      mailMagicGlobalVariables.email = email;

      showConfirmModal({
        msg: 'Are you sure you want to delete all mails and unsubscribe from',
        email,
        onConfirmClick: handleUnsubscribeAndDeleteAllMails,
      });
    });

    // add tooltips to buttons
    addTooltip(unsubscribeBtn, 'Unsubscribe');
    addTooltip(deleteAllMails, 'Delete All Mails');
    addTooltip(unsubscribeAndDeleteAllMailsBtn, 'Unsubscribe & \n Delete All Mails');

    //TODO: show the loading spinner snackbar + a loading icon instead the action button (can show the other action which is left)

    //TODO: Globally add a success snack bar to show after successful action (think about it 🤔)

    //TODO: re-render the table after successfully performing the action
  }
};

const renderNewsletterTab = async (parentContainer: HTMLElement) => {
  // about tab container
  const newsletterTabContainer = document.createElement('div');

  newsletterTabContainer.id = 'settingsModal-newsletterTab';

  // html structure
  newsletterTabContainer.innerHTML = `
    <p>Mail Magic has identified <u id='newsletterTab-numNewsletterEmails'>0</u> emails as newsletters or as part of a mailing list.</p>
   
    <hr />

    <div >
    <table>
    <tbody  id='newsletterTab-table'>
    
    </tbody>
    </table>
    
    </div>

    `;

  parentContainer.appendChild(newsletterTabContainer);

  //* get newsletters data
  // send message to background to get data
  await renderTable([
    { email: 'newsletter.test@flipkart.com' },
    { email: 'newsletter.test@flipkart.com' },
    { email: 'newsletter.test@flipkart.com' },
    { email: 'newsletter.test@flipkart.com' },
    { email: 'newsletter.test-three@example.com' },
    { email: 'newsletter.test-three@example.com' },
    { email: 'mailing-list-world@google.co.com' },
    { email: 'mailing-list-world@google.co.com' },
    { email: 'mailing-list-world@google.co.com' },
    { email: 'manish@one.com' },
    { email: 'manish@one.com' },
    { email: 'asdasdasewq343as@asdasfasfdas.com' },
    { email: 'manishMandal02032@one.com' },
    { email: 'manishMandal02032@one.com' },
    { email: 'manish@one.com' },
    { email: 'asdasdasewq343wasdas@asdasfasfdas.com' },
  ]);

  //   try {
  //     const response = await chrome.runtime.sendMessage({ event: IMessageEvent.GET_NEWSLETTER_EMAILS });
  //     if (response.newsletterEmails) {
  //       // render table from the data
  //      await renderTable(response.newsletterEmails);
  //     } else {
  //       //TODO: render a message saving no newsletter emails found
  //       throw new Error('No newsletter emails found');
  //     }
  //   } catch (err) {
  //     console.log('🚀 ~ file: newsletter.ts:51 ~ renderNewsletterTab ~ err):', err);
  //   }
};

// remove the newsletter tab from DOM
const removeNewsletterTab = () => {
  const newsletterTabContainer = document.getElementById('settingsModal-newsletterTab');

  if (!newsletterTabContainer) return;

  // removes all it's child elements
  while (newsletterTabContainer.firstChild) {
    newsletterTabContainer.removeChild(newsletterTabContainer.firstChild);
  }

  newsletterTabContainer.remove();
};

export { renderNewsletterTab, removeNewsletterTab };
