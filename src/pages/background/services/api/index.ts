import { MAIL_MAGIC_FILTER_EMAIL, storageKeys } from '@src/pages/background/constants/app.constants';
import { removeDuplicateEmails } from '../../utils/removeDuplicateEmails';
import { FILTER_ACTION, IGmailMessage, NewsletterEmails } from '../../types/background.types';
import { getMailMagicFilter } from './gmail/helpers/getMailMagicFilter';
import { deleteFilter, getFilterById } from './gmail/helpers/gmailFilters';
import { createFilter } from 'vite';

const API_MAX_RESULT = 500;

type APIHandleParams = {
  email: string;
  token: string;
};

type GetMsgAPIResponseSuccess = {
  messages: IGmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
};

//* unsubscribe/block email
const unsubscribe = async ({ token, email }: APIHandleParams) => {
  try {
    // check if mail-magic filter id exists in storage
    const syncStore = await chrome.storage.sync.get(storageKeys.MAIL_MAGIC_UNSUBSCRIBE_FILTER_ID);
    let filterId = '';
    let prevFilterEmails = [''];
    if (syncStore && syncStore.MAIL_MAGIC_UNSUBSCRIBE_FILTER_ID) {
      // mailMagicFilterId found in storage
      // get filter by id and return emails
      const filterEmails = await getFilterById(token, syncStore.MAIL_MAGIC_UNSUBSCRIBE_FILTER_ID);
      filterId = syncStore.MAIL_MAGIC_UNSUBSCRIBE_FILTER_ID;
      prevFilterEmails = filterEmails.emails;
    } else {
      // if mailMagicFilterId not found in storage
      // find mail-magic filter from from users filter (gmail api)
      const filterEmails = await getMailMagicFilter({ token, filterAction: FILTER_ACTION.TRASH });
      if (filterEmails) {
        filterId = filterEmails.filterId;
        prevFilterEmails = filterEmails.emails;
        // set mailMagicFilterId to storage
        await chrome.storage.sync.set({ [storageKeys.MAIL_MAGIC_UNSUBSCRIBE_FILTER_ID]: filterId });
      } else {
        // mailMagicFilter not found - create a new mailMagicFilter with the email to unsubscribe/block
        const newFilterId = await createFilter(token, [MAIL_MAGIC_FILTER_EMAIL, email]);
        // set mailMagicFilterId to storage
        await chrome.storage.sync.set({ [storageKeys.MAIL_MAGIC_UNSUBSCRIBE_FILTER_ID]: newFilterId });
        return;
      }
    }

    // add the new email to unsubscribe/block filter
    prevFilterEmails.push(email);

    // create new mail-magic filter with emails from previous filter and add new email
    await createFilter(token, prevFilterEmails);

    //* save the unsubscribed email to storage
    // get all unsubscribed emails from storage
    const syncStore2 = await chrome.storage.sync.get(storageKeys.UNSUBSCRIBED_EMAILS);
    // save the new list of unsubscribed emails
    const updatedUnsubscribedEmails = [...(syncStore2[storageKeys.UNSUBSCRIBED_EMAILS] || []), email];
    await chrome.storage.sync.set({ [storageKeys.UNSUBSCRIBED_EMAILS]: updatedUnsubscribedEmails });

    //* delete previous mail-magic filter
    await deleteFilter(token, filterId);
  } catch (err) {
    console.log('🚀 ~ file: gmail.ts:152 ~ unsubscribe ❌ Failed to unsubscribe ~ err:', err);
  }
};

// delete all mails/messages
const batchDeleteEmails = async (token: string, ids: string[]) => {
  const fetchOptions = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  };

  // batch delete emails
  try {
    await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/batchDelete', fetchOptions);
    console.log('✅ batch delete successful');
  } catch (err) {
    console.log('🚀 ~ file: gmailAPI.ts:23 ~ batchDeleteEmails: Failed to batch delete: ~ err:', err);
  }
};

const deleteAllMails = async ({ token, email }: APIHandleParams) => {
  try {
    const fetchOptions: Partial<RequestInit> = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    let nextPageToken: string | null = null;

    const queryParams = `from:${email}&maxResults=${API_MAX_RESULT}&${
      nextPageToken ? `pageToken=${nextPageToken}` : ''
    }`;

    let parsedRes: GetMsgAPIResponseSuccess | null = null;

    //* do... while() loop to  handle pagination delete if messages/gmail exceeds API max limit (500)
    //* keep fetching & deleting emails until nextPageToken is null
    do {
      // fetch message/emails
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${queryParams}${
          nextPageToken ? `&pageToken=${nextPageToken}` : ''
        }`,
        fetchOptions
      );
      parsedRes = await res.json();

      // stop if no messages found
      if (!parsedRes.messages || (parsedRes.messages && parsedRes.messages.length < 1)) {
        console.log(
          '🚀 ~ file: gmailAPI.ts:38 ~ deleteAllMails ~ Failed to get gmail message: parsedRes:',
          parsedRes
        );
        return;
      }
      console.log('🚀 ~ file: gmailAPI.ts:23 ~ deleteAllMails ~ messages:', parsedRes);

      // save next page token if present to fetch next batch of messages
      if (parsedRes.nextPageToken) {
        nextPageToken = parsedRes.nextPageToken;
      } else {
        nextPageToken = null;
      }

      // get message ids from success response
      const msgIds = parsedRes.messages.map(msg => msg.id);

      // batch delete messages/emails
      await batchDeleteEmails(token, msgIds);
    } while (nextPageToken !== null);
    //* end of do...while loop
  } catch (err) {
    console.log('🚀 ~ file: gmail.ts:242 ~ deleteAllMails ~ err:', err);
  }
};

const unsubscribeAndDeleteAllMails = async ({ email, token }: APIHandleParams) => {
  // unsubscribe
  await unsubscribe({ token, email });

  //delete all mails
  await deleteAllMails({ token, email });
};

type GetSendEmailFromIdsParams = {
  messageIds: string[];
  token: string;
};

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

  const boundary = 'newsletter-boundary'; // Use a unique boundary

  const batchRequest = batchRequestBody.map(request => {
    return `--${boundary}
Content-Type: application/http
Content-ID: ${request.headers['Content-ID']}

${request.method} ${request.path}
`;
  });

  const requestBody = `${batchRequest.join('')}\n--${boundary}--`;

  const fetchOptions = {
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

      console.log('🚀 ~ file: gmail.ts:345 ~ getSenderEmailsFromIds ~ responseText:', responseText);

      // // regular expression pattern to match email addresses
      // const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

      // // Use the match method to find all email addresses in the response string
      // let emailAddresses = responseText.replaceAll('u003c', '').match(emailPattern) as string[];

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

        console.log('🚀 ~ file: gmail.ts:368 ~ getSenderEmailsFromIds ~ valueStr:', valueStr);

        const name = valueStr.split(`\\u003c`)[0].trim();
        // email
        const email = valueStr.split(`\\u003c`)[1].replace('\\u003e', '').trim();
        senderEmails.push({ name, email });

        console.log('🚀 ~ file: gmail.ts:375 ~ getSenderEmailsFromIds ~ email:', email);
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
    console.error('Error making batch request:', error);
  }
};

//* get newsletters/mailing list emails form Gmail ap
const getNewsletterEmails = async (token: string) => {
  const fetchOptions = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
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
      const queryParams = `maxResults=${API_MAX_RESULT}&q={"Unsubscribe"} in:anywhere&${
        nextPageToken ? `pageToken=${nextPageToken}` : ''
      }`;

      console.log('🚀 ~ file: gmail.ts:395 ~ getNewsletterEmails ~ queryParams:', queryParams);

      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?${queryParams}`,
        fetchOptions
      );

      const parsedRes = await res.json();

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
      //  end of do while loop...

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

      //* check if emails are already unsubscribed or whitelisted
      if (newsletterEmails.length > 0) {
        const unsubscribedEmailsStorage = await chrome.storage.sync.get(storageKeys.UNSUBSCRIBED_EMAILS);
        const whitelistedEmailsStorage = await chrome.storage.sync.get(storageKeys.UNSUBSCRIBED_EMAILS);

        // emails to filter out, combining unsubscribed and whitelisted emails
        const filterEmails = [];

        if (unsubscribedEmailsStorage && unsubscribedEmailsStorage[storageKeys.UNSUBSCRIBED_EMAILS]) {
          filterEmails.push(...unsubscribedEmailsStorage[storageKeys.UNSUBSCRIBED_EMAILS]);
        }

        if (whitelistedEmailsStorage && whitelistedEmailsStorage[storageKeys.WHITELISTED_EMAILS]) {
          filterEmails.push(...whitelistedEmailsStorage[storageKeys.WHITELISTED_EMAILS]);
        }

        if (filterEmails.length > 0) {
          // filter emails already unsubscribed or whitelisted
          const filteredEmails = newsletterEmails.filter(email => !filterEmails.includes(email));
          // store the filtered emails
          newsletterEmails = removeDuplicateEmails([...newsletterEmails, ...filteredEmails]);
        } else {
          // store the emails
          newsletterEmails = removeDuplicateEmails([...newsletterEmails]);
        }
        if (!newsletterEmails[0]) {
          newsletterEmails.splice(0, 1);
        }
      }
    } while (nextPageToken !== null && newsletterEmails.length < 100);

    console.log('🚀 ~ file: gmail.ts:404 ~ getNewsletterEmails ~ newsletterEmails:', newsletterEmails);

    return newsletterEmails;

    //
  } catch (err) {
    console.log(
      '🚀 ~ file: gmail.ts:307 ~ getNewsletterEmails ❌ Failed to get newsletter emails ~ err:',
      err
    );
  }
};

export { unsubscribe, deleteAllMails, unsubscribeAndDeleteAllMails, getNewsletterEmails };
