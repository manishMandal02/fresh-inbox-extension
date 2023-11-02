import { tableHeader } from '../../elements/tableHeader';
import {
  handleUnsubscribeAction,
  handleDeleteAllMailsAction,
  handleWhitelistAction,
  handleUnsubscribeAndDeleteAction,
} from '@src/pages/content/utils/emailActions';
import { storageKeys } from '@src/pages/content/constants/app.constants';

import { randomId } from '@src/pages/content/utils/randomId';
import { addTooltip } from '../../elements/tooltip';
import { getLoadingSpinner } from '../../elements/loadingSpinner';
import { renderTextMsg } from '../../elements/text';
import { IMessageEvent } from '@src/pages/content/types/content.types';
import wait from '@src/pages/content/utils/wait';
import { getLocalStorageByKey } from '@src/pages/content/utils/getStorageByKey';
import { logger } from '@src/pages/content/utils/logger';
import { asyncHandler } from '@src/pages/content/utils/asyncHandler';

const NewsletterTabActionBtnContainer = 'newsletterTab-actionBtn';

type NewsletterData = {
  email: string;
  name: string;
};

// tab body html structure
const newsletterTabContainerInnerHTML = `
    <p>Fresh Inbox has identified <u id='newsletterTab-numNewsletterEmails'>0</u> emails as newsletters or as part of a mailing list.</p>
   
    <hr />

    <div >
      <table>
        <tbody  id='newsletterTab-table'>
        </tbody>
      </table>
    
    </div>

    `;

const refreshTable = async ({ shouldRefreshData }: { shouldRefreshData?: boolean }) => {
  // get table container
  const newsletterTabContainer = document.getElementById('settingsModal-newsletterTab');

  if (shouldRefreshData) {
    newsletterTabContainer.innerHTML = ``;
  }

  // loading spinner to show while fetching emails
  const spinner = getLoadingSpinner();
  const loadingMsg = renderTextMsg('Hunting newsletter emails...');

  try {
    // append spinner
    newsletterTabContainer.append(spinner, loadingMsg);

    let newsletterEmails: NewsletterData[] = [];

    // remove loading spinner
    spinner.remove();
    loadingMsg.remove();

    // add inner html structure to tab container
    newsletterTabContainer.innerHTML = newsletterTabContainerInnerHTML;

    // wait for 100ms
    await wait(100);

    if (newsletterEmails) {
      // render table from the data
      await renderTable(newsletterEmails);
    } else {
      // show message saying no newsletter emails found
      const msg = renderTextMsg(
        `📭 No Newsletter or mailing list emails found in your Inbox. <br/> ℹ️ Emails already unsubscribed by Fresh Inbox won't be visible here.`
      );

      // append msg to table
      newsletterTabContainer.appendChild(msg);
    }
  } catch (err) {
    // remove loading spinner
    spinner.remove();
    // show a error message: saying something went wrong
    const msg = renderTextMsg('❌ Something went wrong, Failed to get newsletter emails');
    // append msg to table
    const tableContainer = document.getElementById('newsletterTab-table');
    if (!tableContainer) return;
    tableContainer.appendChild(msg);
    logger.error({
      error: new Error('Failed to get newsletter emails'),
      msg: 'Failed to get newsletter emails',
      fileTrace: 'content/view/settingsModal/tabs/newsletter.ts:119 ~ refreshTable()',
    });
  }
};

// render a single table row
const renderTableRow = async (emailData, idx) => {
  const { email, name } = emailData;
  const rowId = randomId();

  const tableRow = document.createElement('tr');
  const tableRowData = `
    <td>
      <span><strong>${idx + 1}.</strong> <span>${name.replaceAll(`\\`, '').trim()}</span>(${email})</span>
      <div id='${NewsletterTabActionBtnContainer}'>
        <button id='${NewsletterTabActionBtnContainer}-whitelist-${rowId}'>✅</button>
        <button id='${NewsletterTabActionBtnContainer}-unsubscribe-${rowId}'>❌</button>
        <button id='${NewsletterTabActionBtnContainer}-deleteAllMails-${rowId}'>🗑️</button>
        <button id='${NewsletterTabActionBtnContainer}-unsubscribeAndDeleteAllMails-${rowId}'>❌ + 🗑️</button>
      </div>
    </td>
  `;

  tableRow.innerHTML = tableRowData;
  return { tableRow, rowId };
};

// Render the table
const renderTable = async (newsletterEmailsData: NewsletterData[]) => {
  const tableEl = document.getElementById('newsletterTab-table');
  const numOfNewsletterEmails = document.getElementById('newsletterTab-numNewsletterEmails');

  if (!tableEl || !numOfNewsletterEmails) return;

  numOfNewsletterEmails.innerHTML = `${newsletterEmailsData.length}`;
  const th = tableHeader();
  tableEl.appendChild(th);

  newsletterEmailsData.forEach(async (emailData, idx) => {
    const { tableRow, rowId } = await renderTableRow(emailData, idx);
    tableEl.appendChild(tableRow);

    const whitelistBtn = document.getElementById(`${NewsletterTabActionBtnContainer}-whitelist-${rowId}`);
    const unsubscribeBtn = document.getElementById(`${NewsletterTabActionBtnContainer}-unsubscribe-${rowId}`);
    const deleteAllMails = document.getElementById(
      `${NewsletterTabActionBtnContainer}-deleteAllMails-${rowId}`
    );
    const unsubscribeAndDeleteAllMailsBtn = document.getElementById(
      `${NewsletterTabActionBtnContainer}-unsubscribeAndDeleteAllMails-${rowId}`
    );

    if (!whitelistBtn || !unsubscribeBtn || !deleteAllMails || !unsubscribeAndDeleteAllMailsBtn) return;

    // handle whitelist btn click
    whitelistBtn.addEventListener(
      'click',
      asyncHandler(async () => {
        const isSuccess = await handleWhitelistAction({
          email: emailData.email,
          btnContainerId: NewsletterTabActionBtnContainer,
        });
        // refresh table if success
        if (isSuccess) {
          await refreshTable({ shouldRefreshData: false });
        }
      })
    );

    // handle unsubscribe btn click
    unsubscribeBtn.addEventListener(
      'click',
      asyncHandler(async () => {
        const isSuccess = await handleUnsubscribeAction({
          email: emailData.email,
          btnContainerId: NewsletterTabActionBtnContainer,
        });
        // refresh table if success
        if (isSuccess) {
          await refreshTable({ shouldRefreshData: false });
        }
      })
    );

    // handle delete-all-mail btn click
    deleteAllMails.addEventListener('click', async ev => {
      ev.stopPropagation();
      await handleDeleteAllMailsAction({
        email: emailData.email,
        btnContainerId: NewsletterTabActionBtnContainer,
      });
    });

    // handle unsubscribe-and-delete-all-mails btn click
    unsubscribeAndDeleteAllMailsBtn.addEventListener('click', async ev => {
      ev.stopPropagation();
      await handleUnsubscribeAndDeleteAction({
        email: emailData.email,
        btnContainerId: NewsletterTabActionBtnContainer,
        onSuccess: async () => {
          // refresh table if success
          await refreshTable({ shouldRefreshData: false });
        },
      });
    });

    addTooltip(whitelistBtn, 'Keep/Whitelist');
    addTooltip(unsubscribeBtn, 'Unsubscribe');
    addTooltip(deleteAllMails, 'Delete All Mails');
    addTooltip(unsubscribeAndDeleteAllMailsBtn, 'Unsubscribe & \n Delete All Mails');
  });
};

const renderNewsletterTabOLD = async (parentContainer: HTMLElement) => {
  // about tab container
  const newsletterTabContainer = document.createElement('div');

  newsletterTabContainer.id = 'settingsModal-newsletterTab';

  parentContainer.appendChild(newsletterTabContainer);

  // get newsletters data
  await refreshTable({ shouldRefreshData: false });
};

// remove the newsletter tab from DOM
const removeNewsletterTabOLD = () => {
  const newsletterTabContainer = document.getElementById('settingsModal-newsletterTab');

  if (!newsletterTabContainer) return;

  // removes all it's child elements
  newsletterTabContainer.replaceChildren();

  newsletterTabContainer.remove();
};

export { renderNewsletterTabOLD, removeNewsletterTabOLD };
