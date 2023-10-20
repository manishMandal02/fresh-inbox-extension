import { error } from 'console';
import { API_MAX_RESULT } from '@src/pages/background/constants/app.constants';
import type { NewsletterEmails } from '@src/pages/background/types/background.types';
import { removeDuplicateEmails } from '@src/pages/background/utils/removeDuplicateEmails';
import { getUnsubscribedEmails } from './getUnsubscribedEmails';
import { getWhitelistedEmails } from './getWhitelistedEmails';
import { logger } from '@src/pages/background/utils/logger';

type GetSendEmailFromIdsParams = {
  messageIds: string[];
  token: string;
};

// get sender emails & name from message/email ids
const getSenderEmailsFromIds = async ({ messageIds, token }: GetSendEmailFromIdsParams) => {
  // Construct the batch request body
  const batchRequestBody = messageIds.map(id => {
    return {
      method: 'GET',
      path: `/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From`,
      headers: {
        'Content-Type': 'application/http',
        'Content-ID': `message-${id}`,
      },
    };
  });

  // request boundary
  const boundary = 'newsletter_boundary';

  const batchRequest = batchRequestBody.map(request => {
    return `--${boundary}
Content-Type: application/http
Content-ID: ${request.headers['Content-ID']}

${request.method} ${request.path}
`;
  });

  const requestBody = `${batchRequest.join('')}\n--${boundary}--`;

  const fetchOptions: Partial<RequestInit> = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/mixed; boundary=${boundary}`,
    },
    body: requestBody,
  };

  try {
    const res = await fetch(`https://gmail.googleapis.com/batch/gmail/v1`, fetchOptions);

    if (res.ok) {
      // Read the response text as multipart/mixed
      const responseText = (await res.text()).toString();

      // find the headers in the response
      const headersRegex = /"headers":\s*\[([^[\]]*("(name|value)":\s*"[^"]*")[^[\]]*)*\]/g;
      const headerMatches = responseText.match(headersRegex);

      // sender emails (name, emails)
      const senderEmails: NewsletterEmails[] = [];

      // lop through each header match to get names and emails
      for (const header of headerMatches!) {
        // clean the string (remove "{}[]"")
        const cleanStrPattern = /[{"\[\]}]/g;
        // parse value string, contains name & emails
        const valueStr = header.split(`"value":`)[1].replace(cleanStrPattern, '').trim();

        // name
        let name = valueStr.split(`\\u003c`)[0].trim();
        // email
        let email = valueStr.split(`\\u003c`)[1]
          ? valueStr.split(`\\u003c`)[1].replace('\\u003e', '').trim()
          : '';

        if (!email) {
          email = name;
          name = '';
        }

        senderEmails.push({ name, email });
      }

      if (senderEmails.length > 0) {
        // return sender email address
        return senderEmails;
      } else {
        throw new Error('No email addresses found in the response.');
      }
    } else {
      throw new Error(`Batch request failed: err: ${await res.text()}`);
    }
  } catch (error) {
    logger.error({
      error,
      msg: 'Error making batch request',
      fileTrace:
        'background/services/api/gmail/handler/getNewsletterEmails.ts:102 getSenderEmailsFromIds() catch block',
    });
  }
};

// get newsletters/mailing list emails form Gmail ap
export const getNewsletterEmails = async (token: string) => {
  const fetchOptions: Partial<RequestInit> = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  let nextPageToken: string | null = null;

  // message ids batches to be processed
  let batches: string[][] = [];

  // newsletter emails (processed & filtered)
  let newsletterEmails: NewsletterEmails[] = [];

  try {
    // do while loop to handle pagination (gmail api has a response limit of 500)
    do {
      const queryParams = `maxResults=${API_MAX_RESULT}&q={"unsubscribe" "newsletter"} in:anywhere${
        nextPageToken ? `&pageToken=${nextPageToken}` : ''
      }`;

      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?${queryParams}`,
        fetchOptions
      );

      const parsedRes = await res.json();

      // handle api errors
      if (parsedRes.error && parsedRes.error.code === 401) throw new Error('Invalid token');

      if (parsedRes.error) throw new Error(parsedRes.error.message);

      if (parsedRes.messages && parsedRes.messages.length < 1) throw new Error('No emails found');

      // save next page token if present to fetch next batch of messages
      if (parsedRes.nextPageToken) {
        nextPageToken = parsedRes.nextPageToken;
      } else {
        nextPageToken = null;
      }

      // dividing the messageIds into batches ~
      // so we can use the gmail batch api to group multiple requests into on
      const BATCH_SIZE = 45;

      // create batches of emails
      for (let i = 0; i < parsedRes.messages.length; i += BATCH_SIZE) {
        // if last batch is not more than half of batch size then add to previous batch
        batches.push(parsedRes.messages.slice(i, i + BATCH_SIZE).map(msg => msg.id));
      }

      logger.info(
        `Number of batches to process: ${batches.length}`,
        'background/services/api/gmail/handler/getNewsletterEmails.ts:170 ~ getNewsletterEmails()'
      );

      // process batches to get newsletter emails
      for (const batch of batches) {
        // get sender emails from the message ids queried
        const senderEmails = await getSenderEmailsFromIds({
          messageIds: batch,
          token,
        });

        // store the emails
        newsletterEmails = removeDuplicateEmails([...newsletterEmails, ...senderEmails]);
      }

      //* check if these emails are already unsubscribed or whitelisted
      if (newsletterEmails.length > 0) {
        const unsubscribedEmails = await getUnsubscribedEmails(token);

        const whitelistedEmails = await getWhitelistedEmails(token);

        // emails to filter out, combining unsubscribed and whitelisted emails
        const filterEmails = [];

        if (unsubscribedEmails && unsubscribedEmails.length > 0) {
          filterEmails.push(...unsubscribedEmails);
        }

        if (whitelistedEmails && whitelistedEmails.length > 0) {
          filterEmails.push(...whitelistedEmails);
        }

        if (filterEmails.length > 0) {
          // filter emails already unsubscribed or whitelisted
          const filteredNewsletterEmails = newsletterEmails.filter(
            email => !filterEmails.includes(email.email)
          );

          // store the filtered emails
          newsletterEmails = removeDuplicateEmails(filteredNewsletterEmails);
        } else {
          // store the emails
          newsletterEmails = removeDuplicateEmails(newsletterEmails);
        }
        if (!newsletterEmails[0]) {
          newsletterEmails.splice(0, 1);
        }
      }
      //end of do-while loop
    } while (nextPageToken !== null && newsletterEmails.length < 100);

    return newsletterEmails;

    //
  } catch (error) {
    logger.error({
      error,
      msg: 'Error while getting newsletter emails',
      fileTrace:
        'background/services/api/gmail/handler/getNewsletterEmails.ts:230 getNewsletterEmails() catch block',
    });
    return [];
  }
};
