// check for newsletter emails on page

import { API_MAX_RESULT } from '@src/pages/background/constants/app.constants';
import {
  DataOnPage,
  GetMsgAPIResponseSuccess,
  GmailMessage,
} from '@src/pages/background/types/background.types';

type GetNewsletterEmailsOnPageParams = {
  token: string;
  dataOnPage: DataOnPage;
};

export const getNewsletterEmailsOnPage = async ({
  token,
  dataOnPage: { emails, dateRange },
}: GetNewsletterEmailsOnPageParams) => {
  try {
    const fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    // search query get emails on current page
    const searchQuery = `from:(${emails.map(email => `${email.email}`).join(' OR ')}) "unsubscribe" after:${
      dateRange.endDate
    } before:${dateRange.startDate}`;

    console.log('🚀 ~ file: getNewsletterEmailsOnPage.ts:32 ~ searchQuery ~ searchQuery:', searchQuery);

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

    const messages = parsedRes.messages;

    console.log('🚀 ~ file: getNewsletterEmailsOnPage.ts:48 ~ messages:', messages);

    // check for newsletter emails based on search query filter
    // check if the ids of messages received from api match the messages ids on page
    const newsletterEmails = emails
      .filter(email => {
        if (messages.find(message => message.id === email.id)) {
          return true;
        }
      })
      .map(email => email.email);

    return newsletterEmails;
  } catch (err) {
    console.log('🚀 ~ file: checkIfNewsletterEmails.ts:14 ~ getNewsletterEmailsOnPage ~ err:', err);
    //TODO: send to global error handler
    return [];
  }
};
