import { handleReSubscribe } from '@src/pages/content/utils/emailActions';
import { getLoadingSpinner } from '../../elements/loadingSpinner';
import { getUnsubscribedEmails } from '@src/pages/content/utils/getEmailsFromStorage';

// render table
const renderTable = async () => {
  // get table
  const tableEl = document.getElementById('unsubscribedListTab-table');
  if (!tableEl) return;

  // get unsubscribed emails from chrome storage
  const unsubscribedEmails = await getUnsubscribedEmails();

  // set num of unsubscribed emails
  const numOfNewsletterEmails = document.getElementById('unsubscribedListTab-numUnsubscribedEmails');
  numOfNewsletterEmails.innerHTML = `${unsubscribedEmails.length}`;

  // map over data
  const tableData = unsubscribedEmails
    .map(email => {
      return `
    <tr>
        <td>
            <span>
            ${email}
            </span>
            <div>
            <button id='unsubscribedListTab-actionBtn-reSubscribeBtn'>↩️</button>
            </div>
        </td>
    </tr>
    `;
    })
    .join('');

  // show loading spinner fetching data
  const spinner = getLoadingSpinner();
  tableEl.appendChild(spinner);
  //   tableEl.innerHTML = tableData;
};

// render unsubscribed list tab
const renderUnsubscribedListTab = async (parentContainer: HTMLElement) => {
  // about tab container
  const unsubscribedListTabContainer = document.createElement('div');

  unsubscribedListTabContainer.id = 'settingsModal-unsubscribedListTab';

  // html structure
  unsubscribedListTabContainer.innerHTML = `
    <p>Mail Magic has unsubscribed <u id='unsubscribedListTab-numUnsubscribedEmails'>0</u> emails to keep your 📨 inbox clean.</p>

    <hr /> 

    <div>
        <table>
            <tbody  id='unsubscribedListTab-table'>
            </tbody>
        </table>

    </div>

    `;

  parentContainer.appendChild(unsubscribedListTabContainer);

  //TODO: get data

  //* get newsletters data
  // send message to background to get data
  await renderTable();

  //   try {
  //     const response = await chrome.runtime.sendMessage({ event: IMessageEvent.GET_NEWSLETTER_EMAILS });
  //     if (response.newsletterEmails) {
  //       // render table from the data
  //      await renderTable(response.newsletterEmails);
  //     } else {
  //       //TODO: render a message saying that no emails have been unsubscribed by mail magic yet
  //       throw new Error('No ');
  //     }
  //   } catch (err) {
  //     console.log('🚀 ~ file: newsletter.ts:51 ~ renderUnsubscribedListTab ~ err):', err);
  //   }

  // handle on click of re-subscribe button
  // get re-subscribe button element
  const reSubscribeBtn = document.getElementById('unsubscribedListTab-actionBtn-reSubscribeBtn');

  if (!reSubscribeBtn) return;

  // click event listener
  reSubscribeBtn.addEventListener('click', async ev => {
    // get email from the table row
    // set global variable state
    // TODO:
    // mailMagicGlobalVariables.email = email;
    //TODO: get name
    mailMagicGlobalVariables.name = '';
    // handle re-subscribe
    handleReSubscribe();
  });

  //TODO: show the loading spinner snackbar + a loading icon instead the action button (can show the other action which is left)

  //TODO: Globally add a success snack bar to show after successful action (think about it 🤔)

  //TODO: re-render the table after successfully performing the action
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
