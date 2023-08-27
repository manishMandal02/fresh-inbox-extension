import { IMessageEvent } from '@src/pages/content/content.types';

type NewsletterData = {
  email: string;
};

// renderTable
const renderTable = (data: NewsletterData[]) => {
  // get table
  const tableEl = document.getElementById('newsletterTab-table');
  if (!tableEl) return;

  // set num of newsletters (emails) found
  const numOfNewsletterEmails = document.getElementById('newsletterTab-numNewsletterEmails');
  numOfNewsletterEmails.innerHTML = `${data.length}`;

  // map over data
  const tableData = data
    .map(item => {
      return `
    <tr>
        <td>
            <p>
            ${item.email}
            </p>
            <div>
            <button id='newsletterTab-actionBtn-unsubscribe'>❌</button>
            <button id='newsletterTab-actionBtn-deleteAllMails'>🗑️</button>
            <button id='newsletterTab-actionBtn-unsubscribeAndDeleteAllMails'>❌ + 🗑️</button>
            </div>
        </td>
    </tr>
    `;
    })
    .join('');

  tableEl.innerHTML = tableData;
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
  renderTable([
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
  //       renderTable(response.newsletterEmails);
  //     } else {
  //       //TODO: render a message saving no newsletter emails found
  //       throw new Error('No newsletter emails found');
  //     }
  //   } catch (err) {
  //     console.log('🚀 ~ file: newsletter.ts:51 ~ renderNewsletterTab ~ err):', err);
  //   }

  //TODO: add event listener to all the action buttons

  //TODO: show the loading spinner snackbar + a loading icon instead the action button (can show the other action which is left)

  //TODO: Globally add a success snack bar to show after successful action (think about it 🤔)

  //TODO: re-render the table after successfully performing the action
};
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
