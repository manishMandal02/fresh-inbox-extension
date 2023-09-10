import {
  handleUnsubscribe,
  handleDeleteAllMails,
  handleUnsubscribeAndDeleteAllMails,
  handleWhitelist,
} from '@src/pages/content/utils/emailActions';
import { storageKeys } from '@src/pages/content/constants/app.constants';

import { showConfirmModal } from '../../elements/confirmModal';
import { addTooltip } from '../../elements/tooltip';
import { randomId } from '@src/pages/content/utils/randomId';
import { getLoadingSpinner } from '../../elements/loadingSpinner';
import wait from '@src/pages/content/utils/wait';
import { renderTextMsg } from '../../elements/text';
import { IMessageEvent } from '@src/pages/content/content.types';

type NewsletterData = {
  email: string;
  name: string;
};

// show loading spinner instead of action buttons for table row when email actions is processing
const renderLoadingSpinnerInsteadOfButtons = (tableRow: HTMLTableRowElement) => {
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

  // return a callback fn which when called will hide the loading spinner
  return (showActionButtons?: boolean) => {
    // remove/hide spinner
    spinner.remove();

    if (showActionButtons) {
      // show the buttons
      for (const btn of actionBtnContainer.getElementsByTagName('button')) {
        btn.style.display = 'inline-block';
      }
    }
  };
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
    const tableRow = document.createElement('tr');
    // unique id for each row
    const rowId = randomId();

    // table row html
    let tableRowData = `
                <td>
                    
                    <span><strong>${idx + 1}.</strong> <span>${name
      .replaceAll(`\\`, '')
      .trim()}</span>(${email})</span>
                    <div id='newsletterTab-actionBtn'>
                      <button id='newsletterTab-actionBtn-whitelist-${rowId}'>✅</button>
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
    const whitelistBtn = document.getElementById(`newsletterTab-actionBtn-whitelist-${rowId}`);
    const unsubscribeBtn = document.getElementById(`newsletterTab-actionBtn-unsubscribe-${rowId}`);
    const deleteAllMails = document.getElementById(`newsletterTab-actionBtn-deleteAllMails-${rowId}`);
    const unsubscribeAndDeleteAllMailsBtn = document.getElementById(
      `newsletterTab-actionBtn-unsubscribeAndDeleteAllMails-${rowId}`
    );

    if (!whitelistBtn || !unsubscribeBtn || !deleteAllMails || !unsubscribeAndDeleteAllMailsBtn) return;

    whitelistBtn.addEventListener('click', async ev => {
      ev.stopPropagation();
      // set global variable state
      mailMagicGlobalVariables.email = email;
      mailMagicGlobalVariables.name = name;

      // TODO: show loading spinner

      // handle whitelist action
      await handleWhitelist();
    });

    unsubscribeBtn.addEventListener('click', async ev => {
      ev.stopPropagation();

      // set global variable state
      mailMagicGlobalVariables.email = email;
      mailMagicGlobalVariables.name = name;

      // show loading spinner
      const hideLoadingSpinner = renderLoadingSpinnerInsteadOfButtons(tableRow);

      await handleUnsubscribe();

      // ToDo: re-render table if action success (remove the email from table)
    });

    deleteAllMails.addEventListener('click', async ev => {
      ev.stopPropagation();

      // set global variable state
      mailMagicGlobalVariables.email = email;
      mailMagicGlobalVariables.name = name;

      // TODO: show loading spinner
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
      mailMagicGlobalVariables.name = name;

      // TODO: show loading spinner

      showConfirmModal({
        msg: 'Are you sure you want to delete all mails and unsubscribe from',
        email,
        onConfirmClick: handleUnsubscribeAndDeleteAllMails,
      });
    });

    // add tooltips to buttons
    addTooltip(whitelistBtn, 'Whitelist/Keep');
    addTooltip(unsubscribeBtn, 'Unsubscribe');
    addTooltip(deleteAllMails, 'Delete All Mails');
    addTooltip(unsubscribeAndDeleteAllMailsBtn, 'Unsubscribe & \n Delete All Mails');

    //TODO: re-render the table after successfully performing the action
  });
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

  // TODO: testing... table view -delete later
  // await renderTable([
  //   { name: '\\Turing - U.S. Software Jobs\\', email: 'noply+14@turing.com' },
  //   { name: 'Fiverr', email: 'no-reply@ounce.fiverr.com' },
  //   { name: '\\Founders, Newton School\\', email: 'namstey@netonschool.live' },
  // ]);

  //* get newsletters data
  // loading spinner to show while fetching emails
  const spinner = getLoadingSpinner();
  // TODO: uncomment
  try {
    // get table container
    const newsletterEmailsTable = document.getElementById('newsletterTab-table');
    // append spinner
    newsletterEmailsTable.appendChild(spinner);

    let newsletterEmails: NewsletterData[] = [];

    //TODO: check if the newsletter emails data is already stored in chrome.storage.local
    // get local storage data
    const localChromeStorage = await chrome.storage.local.get(storageKeys.NEWSLETTER_EMAILS);

    // check if newsletters data already exists
    if (
      localChromeStorage[storageKeys.NEWSLETTER_EMAILS] &&
      localChromeStorage[storageKeys.NEWSLETTER_EMAILS].length > 0
    ) {
      // data already exists, use it
      newsletterEmails = localChromeStorage[storageKeys.NEWSLETTER_EMAILS];

      console.log(
        '🚀 ~ file: newsletter.ts:241 ~ renderNewsletterTab ~ localChromeStorage[storageKeys.NEWSLETTER_EMAILS]:',
        localChromeStorage[storageKeys.NEWSLETTER_EMAILS]
      );
    } else {
      // data doesn't exist, fetch from background script
      // send message to background to get data
      newsletterEmails = await chrome.runtime.sendMessage({ event: IMessageEvent.GET_NEWSLETTER_EMAILS });

      // save newsletter data to chrome local storage
      await chrome.storage.local.set({ [storageKeys.NEWSLETTER_EMAILS]: newsletterEmails });
      console.log('✅ saved to chrome local storage');
    }

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
