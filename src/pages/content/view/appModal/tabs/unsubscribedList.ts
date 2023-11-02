import { handleReSubscribeAction } from '@src/pages/content/utils/emailActions';
import { getLoadingSpinner } from '../../elements/loadingSpinner';
import { getUnsubscribedEmails } from '@src/pages/content/utils/getEmailsFromStorage';
import { randomId } from '@src/pages/content/utils/randomId';
import { renderLoadingSpinnerInsteadOfButtons } from '@src/pages/content/utils/renderLoadingSpinnerInsteadOfButtons';
import { addTooltip } from '../../elements/tooltip';
import { renderTextMsg } from '../../elements/text';
import wait from '@src/pages/content/utils/wait';
import { tableHeader } from '../../elements/tableHeader';
import { logger } from '@src/pages/content/utils/logger';
import { asyncHandler } from '@src/pages/content/utils/asyncHandler';

const UnsubscribedTabContainerId = 'settingsModal-unsubscribedListTab';

// tab body html structure
const unsubscribedListTabContainerInnerHTML = `
<p>Fresh Inbox has unsubscribed <u id='unsubscribedListTab-numUnsubscribedEmails'>0</u> emails to keep your 📨 inbox clean.</p>

<hr /> 

<div>
    <table>
        <tbody  id='unsubscribedListTab-table'>
        </tbody>
    </table>

</div>
    `;

const refreshTable = async () => {
  // const get table container
  const unsubscribedListTabContainer = document.getElementById(UnsubscribedTabContainerId);

  if (!unsubscribedListTabContainer) return;

  // show loading spinner while fetching data
  const spinner = getLoadingSpinner();
  const loadingMsg = renderTextMsg('Getting unsubscribed emails list...');
  try {
    // append loading spinner and message
    unsubscribedListTabContainer.append(spinner, loadingMsg);

    // get unsubscribed emails list
    const unsubscribedEmails = await getUnsubscribedEmails();

    // remove loading spinner
    spinner.remove();
    loadingMsg.remove();

    if (!unsubscribedEmails) {
      // show error message
      const errorMsg = renderTextMsg('failed to get unsubscribed emails');
      unsubscribedListTabContainer.appendChild(errorMsg);
    } else if (unsubscribedEmails.length === 0) {
      // show error message
      const noDataMsg = renderTextMsg(
        'No Unsubscribed emails found, Start unsubscribing to newsletter emails.'
      );
      unsubscribedListTabContainer.appendChild(noDataMsg);
    } else {
      // found unsubscribed emails
      // add inner html structure to tab container
      unsubscribedListTabContainer.innerHTML = unsubscribedListTabContainerInnerHTML;
      // wait for 100ms
      await wait(100);
      // render table with data
      await renderTable(unsubscribedEmails);
    }
  } catch (error) {
    logger.error({
      error: new Error('Failed to get unsubscribed emails'),
      msg: 'Failed to get unsubscribed emails',
      fileTrace: 'content/view/settingsModal/tabs/unsubscribedList.ts:72 ~ refreshTable()',
    });
  }
};

// render table
const renderTable = async (unsubscribedEmails: string[]) => {
  // get table
  const tableEl = document.getElementById('unsubscribedListTab-table');
  if (!tableEl) return;

  // set num of unsubscribed emails
  const numOfNewsletterEmails = document.getElementById('unsubscribedListTab-numUnsubscribedEmails');
  numOfNewsletterEmails.innerHTML = `${unsubscribedEmails.length}`;

  // add header to table
  const th = tableHeader();
  tableEl.appendChild(th);

  unsubscribedEmails.forEach((email, idx) => {
    // unique id for each row
    const rowId = randomId();
    // render table row
    const tableRow = document.createElement('tr');
    // add html to row
    tableRow.innerHTML = `
      <td>
      <span><strong>${idx + 1}.</strong> ${email}</span>
        <div id='unsubscribedListTab-actionBtn'>
          <button
          id="unsubscribedListTab-reSubscribeBtn-${rowId}">
            ✅
          </button>
        </div>
      </td>
    `;

    tableEl.appendChild(tableRow);

    // add event listener to reSubscribe button
    const reSubscribeBtn = document.getElementById(`unsubscribedListTab-reSubscribeBtn-${rowId}`);

    if (!reSubscribeBtn) return;

    reSubscribeBtn.addEventListener(
      'click',
      asyncHandler(async () => {
        // show loading spinner
        const hideLoadingSpinner = renderLoadingSpinnerInsteadOfButtons('unsubscribedListTab-actionBtn');

        // handle whitelist action
        const isSuccess = await handleReSubscribeAction({
          emails: [email],
          btnContainerId: 'unsubscribedListTab-actionBtn',
        });

        // hide loading spinner
        if (isSuccess) {
          hideLoadingSpinner();
          // re-render table on success
          await refreshTable();
        } else {
          hideLoadingSpinner(true);
        }
      })
    );

    // add tooltips to buttons
    addTooltip(reSubscribeBtn, 're-Subscribe/Whitelist');

    // end of for loop
  });
};

// render unsubscribed list tab
const renderUnsubscribedListTab = async (parentContainer: HTMLElement) => {
  // about tab container
  const unsubscribedListTabContainer = document.createElement('div');

  unsubscribedListTabContainer.id = UnsubscribedTabContainerId;

  parentContainer.appendChild(unsubscribedListTabContainer);

  await refreshTable();
};

// remove the unsubscribed list tab from DOM
const removeUnsubscribedListTab = () => {
  const unsubscribedListTabContainer = document.getElementById(UnsubscribedTabContainerId);

  if (!unsubscribedListTabContainer) return;

  // removes all it's child elements
  unsubscribedListTabContainer.replaceChildren();

  unsubscribedListTabContainer.remove();
};

export { renderUnsubscribedListTab, removeUnsubscribedListTab };