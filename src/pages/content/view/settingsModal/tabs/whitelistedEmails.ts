import {
  handleDeleteAllMails,
  handleReSubscribe,
  handleUnsubscribe,
  handleUnsubscribeAndDeleteAllMails,
} from '@src/pages/content/utils/emailActions';
import { getLoadingSpinner } from '../../elements/loadingSpinner';
import { getWhitelistedEmails } from '@src/pages/content/utils/getEmailsFromStorage';
import { randomId } from '@src/pages/content/utils/randomId';
import { renderLoadingSpinnerInsteadOfButtons } from '@src/pages/content/utils/renderLoadingSpinnerInsteadOfButtons';
import { addTooltip } from '../../elements/tooltip';
import { renderTextMsg } from '../../elements/text';
import wait from '@src/pages/content/utils/wait';
import { showConfirmModal } from '../../elements/confirmModal';

// tab body html structure
const whitelistedEmailsTabContainerInnerHTML = `
<p>Mail Magic has whitelisted <u id='whitelistedEmailsTab-numUnsubscribedEmails'>0</u> emails to keep your 📨 inbox clutter free.</p>

<hr /> 

<div>
    <table>
        <tbody  id='whitelistedEmailsTab-table'>
        </tbody>
    </table>

</div>
    `;

// render table
const renderTable = async (whitelistedEmails: string[]) => {
  // get table
  const tableEl = document.getElementById('whitelistedEmailsTab-table');
  if (!tableEl) return;

  // set num of whitelisted emails
  const numOfNewsletterEmails = document.getElementById('whitelistedEmailsTab-numUnsubscribedEmails');
  numOfNewsletterEmails.innerHTML = `${whitelistedEmails.length}`;

  whitelistedEmails.forEach((email, idx) => {
    // unique id for each row
    const rowId = randomId();
    // render table row
    const tableRow = document.createElement('tr');
    // add html to row
    tableRow.innerHTML = `
    <td>
        <span><strong>${idx + 1}.</strong> ${email}</span>
        <div id='whitelistedEmailsTab-actionBtn'>
          <button id='whitelistedEmailsTab-actionBtn-unsubscribe-${rowId}'>❌</button>
          <button id='whitelistedEmailsTab-actionBtn-deleteAllMails-${rowId}'>🗑️</button>
          <button id='whitelistedEmailsTab-actionBtn-unsubscribeAndDeleteAllMails-${rowId}'>❌ + 🗑️</button>
        </div>
    </td>
    `;
    tableEl.appendChild(tableRow);

    // add event listener to reSubscribe button
    const unsubscribeBtn = document.getElementById(`whitelistedEmailsTab-actionBtn-unsubscribe-${rowId}`);
    const deleteAllMails = document.getElementById(`whitelistedEmailsTab-actionBtn-deleteAllMails-${rowId}`);
    const unsubscribeAndDeleteAllMailsBtn = document.getElementById(
      `whitelistedEmailsTab-actionBtn-unsubscribeAndDeleteAllMails-${rowId}`
    );

    if (!unsubscribeBtn || !deleteAllMails || !unsubscribeAndDeleteAllMailsBtn) return;

    unsubscribeBtn.addEventListener('click', async ev => {
      ev.stopPropagation();

      // set global variable state
      mailMagicGlobalVariables.email = email;
      mailMagicGlobalVariables.name = '';

      // show loading spinner
      const hideLoadingSpinner = renderLoadingSpinnerInsteadOfButtons(tableRow);

      const isSuccess = await handleUnsubscribe();

      // hide loading spinner
      if (isSuccess) {
        hideLoadingSpinner();
      } else {
        hideLoadingSpinner(true);
      }

      // ToDo: re-render table if action success (remove the email from table)
    });

    deleteAllMails.addEventListener('click', async ev => {
      ev.stopPropagation();

      // set global variable state
      mailMagicGlobalVariables.email = email;
      mailMagicGlobalVariables.name = '';

      //  show confirmation modal before deleting all mails
      showConfirmModal({
        msg: 'Are you sure you want to delete all mails  from',
        email,
        onConfirmClick: async () => {
          // show loading spinner
          const hideLoadingSpinner = renderLoadingSpinnerInsteadOfButtons(tableRow);

          const isSuccess = await handleDeleteAllMails();

          // hide loading spinner
          if (isSuccess) {
            hideLoadingSpinner();
          } else {
            hideLoadingSpinner(true);
          }
        },
      });
    });

    unsubscribeAndDeleteAllMailsBtn.addEventListener('click', async ev => {
      ev.stopPropagation();

      // set global variable state
      mailMagicGlobalVariables.email = email;
      mailMagicGlobalVariables.name = '';

      //  show confirmation modal before unsubscribing & deleting all mails
      showConfirmModal({
        msg: 'Are you sure you want to delete all mails and unsubscribe from',
        email,
        onConfirmClick: async () => {
          // show loading spinner
          const hideLoadingSpinner = renderLoadingSpinnerInsteadOfButtons(tableRow);

          const isSuccess = await handleUnsubscribeAndDeleteAllMails();

          // hide loading spinner
          if (isSuccess) {
            hideLoadingSpinner();
          } else {
            hideLoadingSpinner(true);
          }
        },
      });
    });

    addTooltip(unsubscribeBtn, 'Unsubscribe');
    addTooltip(deleteAllMails, 'Delete All Mails');
    addTooltip(unsubscribeAndDeleteAllMailsBtn, 'Unsubscribe & \n Delete All Mails');

    //TODO: re-render table on success

    // end of for loop
  });
};

// render whitelisted list tab
const renderWhitelistedEmailsTab = async (parentContainer: HTMLElement) => {
  // about tab container
  const whitelistedEmailsTabContainer = document.createElement('div');

  whitelistedEmailsTabContainer.id = 'settingsModal-whitelistedEmailsTab';

  parentContainer.appendChild(whitelistedEmailsTabContainer);

  // show loading spinner while fetching data
  const spinner = getLoadingSpinner();
  const loadingMsg = renderTextMsg('Getting whitelisted emails list...');
  try {
    // append loading spinner and message
    whitelistedEmailsTabContainer.append(spinner, loadingMsg);

    // get whitelisted emails list
    // const whitelistedEmails = await getWhitelistedEmails();
    const whitelistedEmails = [
      'test@testexample.com',
      'test2@testexample.com',
      'test@testexample.com',
      'test3test3test3@testexample.com',
      'asdas343wdasdas@testexample.com',
      'test3test3test3@testexample.com',
      'asdas343wdasdasasdas343wdasdasasdas343wda@testexample.com',
      '24@testexample.com',
    ];

    console.log(
      '🚀 ~ file: whitelistedEmails.ts:116 ~ renderWhitelistedEmailsTab ~ whitelistedEmails:',
      whitelistedEmails
    );
    // remove loading spinner
    spinner.remove();
    loadingMsg.remove();

    if (!whitelistedEmails) {
      // show error message
      const errorMsg = renderTextMsg('failed to get whitelisted emails list');
      whitelistedEmailsTabContainer.appendChild(errorMsg);
    } else if (whitelistedEmails.length === 0) {
      // show error message
      const noDataMsg = renderTextMsg(
        'No whitelisted emails found, You can whitelist emails to keep them in your Inbox.'
      );
      whitelistedEmailsTabContainer.appendChild(noDataMsg);
    } else {
      // found whitelisted emails
      // add inner html structure to tab container
      whitelistedEmailsTabContainer.innerHTML = whitelistedEmailsTabContainerInnerHTML;
      // wait for 100ms
      await wait(100);
      // render table with data
      await renderTable(whitelistedEmails);
    }
  } catch (err) {
    spinner.remove();
    loadingMsg.remove();
    // show error message
    const errorMsg = renderTextMsg('failed to get whitelisted emails list');
    whitelistedEmailsTabContainer.appendChild(errorMsg);
    console.log('🚀 ~ file: whitelistedEmails.ts:112 ~ renderWhitelistedEmailsTab ~ err:', err);
  }
};

// remove the whitelisted list tab from DOM
const removeWhitelistedEmailsTab = () => {
  const whitelistedEmailsTabContainer = document.getElementById('settingsModal-whitelistedEmailsTab');

  if (!whitelistedEmailsTabContainer) return;

  // removes all it's child elements
  while (whitelistedEmailsTabContainer.firstChild) {
    whitelistedEmailsTabContainer.removeChild(whitelistedEmailsTabContainer.firstChild);
  }

  whitelistedEmailsTabContainer.remove();
};

export { renderWhitelistedEmailsTab, removeWhitelistedEmailsTab };
