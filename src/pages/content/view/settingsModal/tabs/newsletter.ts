import {
  handleUnsubscribe,
  handleDeleteAllMails,
  handleUnsubscribeAndDeleteAllMails,
} from '@src/pages/content/utils/emailActions';
import { storageKeys } from '@src/pages/content/constants/app.constants';

import { showConfirmModal } from '../../elements/confirmModal';
import { addTooltip, removeTooltip } from '../../elements/tooltip';
import { randomId } from '@src/pages/content/utils/randomId';
import { getLoadingSpinner } from '../../elements/loadingSpinner';
import { hideLoadingSnackbar, showLoadingSnackbar } from '../../elements/snackbar';
import wait from '@src/pages/content/utils/wait';
import { IMessageEvent } from '@src/pages/content/content.types';
import { renderTextMsg } from '../../elements/text';

type NewsletterData = {
  email: string;
  name: string;
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
      return !unsubscribedEmails.includes(email);
    });
  }

  // loop over emails data to render table rows
  newsletterEmails.forEach(({ email, name }, idx) => {
    console.log('🚀 ~ file: newsletter.ts:44 ~ renderTable ~ email:', email);

    // table row
    const tableRow = document.createElement('tr');
    // unique id for each row
    const rowId = randomId();

    // map over data
    let tableRowData = `
                <td>
                    
                    <span><strong>${idx + 1}.</strong> ${email}</span>
                    <div id='newsletterTab-actionBtn'>
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
      //TODO: show a loading spinner instead of action buttons for that row
      // get all the action buttons for that row
      const actionBtnContainer = tableRow.getElementsByTagName('div')?.[0];
      // storing the buttons because we will re-add them, if action fails

      // hide the buttons
      for (const btn of actionBtnContainer.getElementsByTagName('button')) {
        btn.style.display = 'none';
      }

      // create a spinner
      const spinner = getLoadingSpinner();

      // add spinner and remove buttons
      actionBtnContainer.appendChild(spinner);

      //TODO: show a loading snackbar
      showLoadingSnackbar({ title: 'Unsubscribing from', email });

      await wait(3000);

      // remove/hide spinner
      spinner.remove();
      hideLoadingSnackbar();

      // show the buttons
      for (const btn of actionBtnContainer.getElementsByTagName('button')) {
        btn.style.display = 'inline-block';
      }

      // await handleUnsubscribe();
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

    //TODO: re-render the table after successfully performing the action
  });
};

// TODO: Try to save the newsletter data on the content script if the query operation is expensive ~
// TODO: ~ we can have a global variable to store these emails and only fetch once per session

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

  // TODO: testing... table view
  // await renderTable([
  //   { email: 'newsletter.test@flipkart.com' },
  //   { email: 'newsletter.test@flipkart.com' },
  //   { email: 'newsletter.test@flipkart.com' },
  //   { email: 'newsletter.test@flipkart.com' },
  //   { email: 'newsletter.test-three@example.com' },
  //   { email: 'newsletter.test-three@example.com' },
  //   { email: 'mailing-list-world@google.co.com' },
  //   { email: 'mailing-list-world@google.co.com' },
  //   { email: 'mailing-list-world@google.co.com' },
  //   { email: 'manish@one.com' },
  //   { email: 'manish@one.com' },
  //   { email: 'asdasdasewq343as@asdasfasfdas.com' },
  //   { email: 'manishMandal02032@one.com' },
  //   { email: 'manishMandal02032@one.com' },
  //   { email: 'manish@one.com' },
  //   { email: 'asdasdasewq343wasdas@asdasfasfdas.com' },
  // ]);

  //* get newsletters data
  // loading spinner to show while fetching emails
  const spinner = getLoadingSpinner();
  try {
    // get table container
    const newsletterEmailsTable = document.getElementById('newsletterTab-table');
    // append spinner
    newsletterEmailsTable.appendChild(spinner);

    // send message to background to get data
    const newsletterEmails = await chrome.runtime.sendMessage({ event: IMessageEvent.GET_NEWSLETTER_EMAILS });

    console.log('🚀 ~ file: newsletter.ts:216 ~ renderNewsletterTab ~ newsletterEmails:', newsletterEmails);

    // remove loading spinner
    spinner.remove();
    if (newsletterEmails) {
      // render table from the data
      await renderTable(newsletterEmails);
    } else {
      // show message saying no newsletter emails found
      const msg = renderTextMsg(
        `📭 No Newsletter or mailing list emails found in your Inbox. <br/> ℹ️ Emails already unsubscribed by Mail Magic won't be visible here.`
      );
      // append msg to table
      const tableContainer = document.getElementById('newsletterTab-table');
      tableContainer.appendChild(msg);
    }
  } catch (err) {
    // remove loading spinner
    spinner.remove();
    console.log('🚀 ~ file: newsletter.ts:51 ~ renderNewsletterTab ~ err):', err);
    // show a error message: saying something went wrong
    const msg = renderTextMsg('❌ Something went wrong, Failed to get newsletter');
    // append msg to table
    const tableContainer = document.getElementById('newsletterTab-table');
    tableContainer.appendChild(msg);
  }
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
