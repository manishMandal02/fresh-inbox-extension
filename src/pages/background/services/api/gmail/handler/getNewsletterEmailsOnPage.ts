import { API_MAX_RESULT } from '@src/pages/background/constants/app.constants';
import { DataOnPage, GetMsgAPIResponseSuccess } from '@src/pages/background/types/background.types';
import { getWhitelistedEmails } from './getWhitelistedEmails';

type GetNewsletterEmailsOnPageParams = {
  token: string;
  dataOnPage: DataOnPage;
};

// check for newsletter emails on page
export const getNewsletterEmailsOnPage = async ({
  token,
  dataOnPage: { emails, dateRange, category, folder },
}: GetNewsletterEmailsOnPageParams) => {
  try {
    const fetchOptions: Partial<RequestInit> = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    // search query to check if the provided emails are newsletter emails or not
    // filter based on date range, category and folder (so that we get only the emails on the current page not all)
    const searchQuery = `from:(${emails.map(email => `${email.email}`).join(' OR ')}) "unsubscribe"
     after:${dateRange.endDate} before:${dateRange.startDate} 
    ${category ? `category:${category}` : ''} 
    ${folder === 'all' ? '' : `in:${folder}`}
    `;

    console.log('🚀 ~ file: getNewsletterEmailsOnPage.ts:35 ~ searchQuery:', searchQuery);

    // call to gmail api
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${searchQuery}&maxResults=${API_MAX_RESULT}`,
      fetchOptions
    );

    // parse response
    const parsedRes: GetMsgAPIResponseSuccess = await res.json();

    console.log('🚀 ~ file: getNewsletterEmailsOnPage.ts:41 ~ parsedRes:', parsedRes);

    if (!parsedRes.messages) {
      console.log('🙌 No newsletter emails found.');
      return [];
    }

    // newsletter emails based on search query filter
    const messages = parsedRes.messages;

    // check if the ids of messages received from api match the messages ids on page
    let newsletterEmails = emails
      .filter(email => {
        if (messages.find(message => message.id === email.id)) {
          return true;
        }
      })
      .map(email => email.email);

    console.log('🚀 ~ file: getNewsletterEmailsOnPage.ts:67 ~ newsletterEmails:', newsletterEmails);

    // remove whitelisted emails from newsletter emails
    const whitelistedEmails = await getWhitelistedEmails(token);

    if (whitelistedEmails.length > 0) {
      newsletterEmails = newsletterEmails.filter(email => !whitelistedEmails.includes(email));
    }

    return newsletterEmails;
  } catch (err) {
    console.log('🚀 ~ file: checkIfNewsletterEmails.ts:14 ~ getNewsletterEmailsOnPage ~ err:', err);
    //TODO: send to global error handler
    return [];
  }
};
