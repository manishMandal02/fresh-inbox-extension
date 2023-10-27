import {
  handleUnsubscribeAction,
  handleDeleteAllMailsAction,
  handleUnsubscribeAndDeleteAction,
} from '@src/pages/content/utils/emailActions';
import { getLoadingSpinner } from '../../elements/loadingSpinner';
import { getWhitelistedEmails } from '@src/pages/content/utils/getEmailsFromStorage';
import { randomId } from '@src/pages/content/utils/randomId';
import { addTooltip } from '../../elements/tooltip';
import { renderTextMsg } from '../../elements/text';
import wait from '@src/pages/content/utils/wait';
import { tableHeader } from '../../elements/tableHeader';
import { logger } from '@src/pages/content/utils/logger';

const WhitelistedEmailsTabActionBtnContainer = 'whitelistedEmailsTab-actionBtn';

// tab body html structure
const whitelistedEmailsTabContainerInnerHTML = `
<p>Fresh Inbox has whitelisted <u id='whitelistedEmailsTab-numUnsubscribedEmails'>0</u> emails to keep your 📨 inbox clutter free.</p>

<hr /> 

<div>
    <table>
        <tbody  id='whitelistedEmailsTab-table'>
        </tbody>
    </table>

</div>
    `;

const refreshTable = async () => {
  // get table container
  const whitelistedEmailsTabContainer = document.getElementById('settingsModal-whitelistedEmailsTab');

  if (!whitelistedEmailsTabContainer) return;

  // show loading spinner while fetching data
  const spinner = getLoadingSpinner();
  const loadingMsg = renderTextMsg('Getting whitelisted emails list...');
  try {
    // append loading spinner and message
    whitelistedEmailsTabContainer.append(spinner, loadingMsg);

    // get whitelisted emails list
    const whitelistedEmails = await getWhitelistedEmails();

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
  } catch (error) {
    spinner.remove();
    loadingMsg.remove();
    // show error message
    const errorMsg = renderTextMsg('failed to get whitelisted emails list');
    whitelistedEmailsTabContainer.appendChild(errorMsg);
    logger.error({
      error: error,
      msg: 'Failed to get whitelisted emails',
      fileTrace: 'content/view/settingsModal/tabs/whitelistedEmail.ts:81 ~ refreshTable()',
    });
  }
};

// render table
const renderTable = async (whitelistedEmails: string[]) => {
  // get table
  const tableEl = document.getElementById('whitelistedEmailsTab-table');
  if (!tableEl) return;

  // set num of whitelisted emails
  const numOfNewsletterEmails = document.getElementById('whitelistedEmailsTab-numUnsubscribedEmails');
  numOfNewsletterEmails.innerHTML = `${whitelistedEmails.length}`;

  // add header to table
  const th = tableHeader();
  tableEl.appendChild(th);

  whitelistedEmails.forEach((email, idx) => {
    // unique id for each row
    const rowId = randomId();
    // render table row
    const tableRow = document.createElement('tr');
    // add html to row
    tableRow.innerHTML = `
    <td>
        <span><strong>${idx + 1}.</strong> ${email}</span>
        <div id='${WhitelistedEmailsTabActionBtnContainer}'>
          <button id='${WhitelistedEmailsTabActionBtnContainer}-unsubscribe-${rowId}'>❌</button>
          <button id='${WhitelistedEmailsTabActionBtnContainer}-deleteAllMails-${rowId}'>🗑️</button>
          <button id='${WhitelistedEmailsTabActionBtnContainer}-unsubscribeAndDeleteAllMails-${rowId}'>❌ + 🗑️</button>
        </div>
    </td>
    `;
    tableEl.appendChild(tableRow);

    // add event listener to reSubscribe button
    const unsubscribeBtn = document.getElementById(
      `${WhitelistedEmailsTabActionBtnContainer}-unsubscribe-${rowId}`
    );
    const deleteAllMails = document.getElementById(
      `${WhitelistedEmailsTabActionBtnContainer}-deleteAllMails-${rowId}`
    );
    const unsubscribeAndDeleteAllMailsBtn = document.getElementById(
      `${WhitelistedEmailsTabActionBtnContainer}-unsubscribeAndDeleteAllMails-${rowId}`
    );

    if (!unsubscribeBtn || !deleteAllMails || !unsubscribeAndDeleteAllMailsBtn) return;

    unsubscribeBtn.addEventListener('click', () => async ev => {
      ev.stopPropagation();
      const isSuccess = handleUnsubscribeAction({
        email,
        btnContainerId: WhitelistedEmailsTabActionBtnContainer,
      });
      // refresh table if success
      if (isSuccess) {
        await refreshTable();
      }
    });

    deleteAllMails.addEventListener('click', () => async ev => {
      ev.stopPropagation();

      handleDeleteAllMailsAction({ email, btnContainerId: WhitelistedEmailsTabActionBtnContainer });
    });

    unsubscribeAndDeleteAllMailsBtn.addEventListener('click', () => async ev => {
      ev.stopPropagation();

      handleUnsubscribeAndDeleteAction({
        email,
        btnContainerId: WhitelistedEmailsTabActionBtnContainer,
        onSuccess: async () => {
          // refresh table if success
          await refreshTable();
        },
      });
    });

    addTooltip(unsubscribeBtn, 'Unsubscribe');
    addTooltip(deleteAllMails, 'Delete All Mails');
    addTooltip(unsubscribeAndDeleteAllMailsBtn, 'Unsubscribe & \n Delete All Mails');

    // end of for loop
  });
};

// render whitelisted list tab
const renderWhitelistedEmailsTab = async (parentContainer: HTMLElement) => {
  // about tab container
  const whitelistedEmailsTabContainer = document.createElement('div');

  whitelistedEmailsTabContainer.id = 'settingsModal-whitelistedEmailsTab';

  parentContainer.appendChild(whitelistedEmailsTabContainer);

  await refreshTable();
};

// remove the whitelisted list tab from DOM
const removeWhitelistedEmailsTab = () => {
  const whitelistedEmailsTabContainer = document.getElementById('settingsModal-whitelistedEmailsTab');

  if (!whitelistedEmailsTabContainer) return;

  // removes all it's child elements
  whitelistedEmailsTabContainer.replaceChildren();

  whitelistedEmailsTabContainer.remove();
};

export { renderWhitelistedEmailsTab, removeWhitelistedEmailsTab };
