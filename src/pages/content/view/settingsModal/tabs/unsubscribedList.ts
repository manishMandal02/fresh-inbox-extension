import { handleReSubscribe } from '@src/pages/content/utils/emailActions';
import { getLoadingSpinner } from '../../elements/loadingSpinner';
import { getUnsubscribedEmails } from '@src/pages/content/utils/getEmailsFromStorage';
import { randomId } from '@src/pages/content/utils/randomId';
import { renderLoadingSpinnerInsteadOfButtons } from '@src/pages/content/utils/renderLoadingSpinnerInsteadOfButtons';
import { addTooltip } from '../../elements/tooltip';
import { renderTextMsg } from '../../elements/text';
import wait from '@src/pages/content/utils/wait';

// tab body html structure
const unsubscribedListTabContainerInnerHTML = `
<p>Mail Magic has unsubscribed <u id='unsubscribedListTab-numUnsubscribedEmails'>0</u> emails to keep your 📨 inbox clean.</p>

<hr /> 

<div>
    <table>
        <tbody  id='unsubscribedListTab-table'>
        </tbody>
    </table>

</div>
    `;

// render table
const renderTable = async (unsubscribedEmails: string[]) => {
  // get table
  const tableEl = document.getElementById('unsubscribedListTab-table');
  if (!tableEl) return;

  // set num of unsubscribed emails
  const numOfNewsletterEmails = document.getElementById('unsubscribedListTab-numUnsubscribedEmails');
  numOfNewsletterEmails.innerHTML = `${unsubscribedEmails.length}`;

  unsubscribedEmails.forEach((email, idx) => {
    // unique id for each row
    const rowId = randomId();
    // render table row
    const tableRow = document.createElement('tr');
    // add html to row
    tableRow.innerHTML = `
      <td>
      <span><strong>${idx + 1}.</strong> ${email}</span>
        <div>
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

    reSubscribeBtn.addEventListener('click', async () => {
      // show loading spinner
      // set global variable state
      mailMagicGlobalVariables.email = email;
      mailMagicGlobalVariables.name = '';

      // show loading spinner
      const hideLoadingSpinner = renderLoadingSpinnerInsteadOfButtons(tableRow);

      // handle whitelist action
      const isSuccess = await handleReSubscribe();

      // hide loading spinner
      if (isSuccess) {
        hideLoadingSpinner();
      } else {
        hideLoadingSpinner(true);
      }
    });

    // add tooltips to buttons
    addTooltip(reSubscribeBtn, 'Re-Subscribe');

    //TODO: re-render table on success

    // end of for loop
  });
};

// render unsubscribed list tab
const renderUnsubscribedListTab = async (parentContainer: HTMLElement) => {
  // about tab container
  const unsubscribedListTabContainer = document.createElement('div');

  unsubscribedListTabContainer.id = 'settingsModal-unsubscribedListTab';

  parentContainer.appendChild(unsubscribedListTabContainer);

  // show loading spinner while fetching data
  const spinner = getLoadingSpinner();
  const loadingMsg = renderTextMsg('Getting unsubscribed emails list...');
  try {
    // append loading spinner and message
    unsubscribedListTabContainer.append(spinner, loadingMsg);

    // get unsubscribed emails list
    // const unsubscribedEmails = await getUnsubscribedEmails();
    const unsubscribedEmails = [
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
      '🚀 ~ file: unsubscribedList.ts:116 ~ renderUnsubscribedListTab ~ unsubscribedEmails:',
      unsubscribedEmails
    );
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
  } catch (err) {
    console.log('🚀 ~ file: unsubscribedList.ts:112 ~ renderUnsubscribedListTab ~ err:', err);
  }
};

// remove the unsubscribed list tab from DOM
const removeUnsubscribedListTab = () => {
  const unsubscribedListTabContainer = document.getElementById('settingsModal-unsubscribedListTab');

  if (!unsubscribedListTabContainer) return;

  // removes all it's child elements
  while (unsubscribedListTabContainer.firstChild) {
    unsubscribedListTabContainer.removeChild(unsubscribedListTabContainer.firstChild);
  }

  unsubscribedListTabContainer.remove();
};

export { renderUnsubscribedListTab, removeUnsubscribedListTab };
