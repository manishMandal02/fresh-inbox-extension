import { MAIL_MAGIC_FILTER_EMAIL, storageKeys } from '@src/pages/background/constants/app.constants';
import { getEmailsFromFilterQuery } from '../utils/getEmailsFromFilterQuery';

const API_MAX_RESULT = 500;

const TRASH_ACTION = 'TRASH';

type APIHandleParams = {
  email: string;
  token: string;
};

type GmailFilter = {
  id: string;
  criteria: {
    query: string;
  };
  action: {
    addLabelIds: string[];
  };
};

type GmailFilters = {
  filters: GmailFilter[];
};

type FilterEmails = {
  filterId?: string;
  emails: string[];
};

// get  filter by Id
const getFilterById = async (token: string, id: string): Promise<FilterEmails | null> => {
  const fetchOptions = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/settings/filters/${id}`,
      fetchOptions
    );
    const parsedRes: GmailFilter | null = await res.json();
    if (!parsedRes || !parsedRes.criteria.query) throw new Error('❌ Failed to get filters');

    // get emails from query
    const emails = getEmailsFromFilterQuery(parsedRes.criteria.query);

    return { emails };
  } catch (err) {
    console.log('🚀 ~ file: gmail.ts:25 ~ checkForTrashFilter: ❌ Failed get filters ~ err:', err);
    return null;
  }
};

// get mail-magic filter id also return all emails optionally
const getMailMagicFilter = async (token: string): Promise<FilterEmails | null> => {
  const fetchOptions = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/settings/filters', fetchOptions);
    const parsedRes: GmailFilters | null = await res.json();
    if (!parsedRes.filters) throw new Error('Failed to get filters');

    let filterId = '';
    let emails: string[] = [];

    for (const filter of parsedRes.filters) {
      if ((filter.action.addLabelIds.length = 1) && filter.action.addLabelIds[0] === TRASH_ACTION) {
        // get emails from the filter criteria
        const queryEmails = getEmailsFromFilterQuery(filter.criteria.query);
        if (queryEmails.includes(MAIL_MAGIC_FILTER_EMAIL)) {
          filterId = filter.id;
          emails = queryEmails;
          // stop the loop
          break;
        }
      }
    }
    if (filterId) {
      return {
        filterId,
        emails,
      };
    } else {
      throw new Error('Mail Magic filter not found');
    }
  } catch (err) {
    console.log('🚀 ~ file: gmail.ts:25 ~ checkForTrashFilter: ❌ Failed get filters ~ err:', err);
    return null;
  }
};

// create filter with mail-magic email get emails array
const createFilter = async (token: string, emails: string[]): Promise<string | null> => {
  // format the emails into a single query string for filter criteria
  const criteriaQuery = `{${emails.map(email => `from:${email} `)}}`;

  const fetchOptions = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: {
        addLabelIds: [TRASH_ACTION],
      },
      criteria: {
        query: criteriaQuery,
      },
    }),
  };

  try {
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/settings/filters`, fetchOptions);
    console.log(`✅ Successfully created filter`);
    const newFilter: GmailFilter = await res.json();
    return newFilter.id;
  } catch (err) {
    console.log('🚀 ~ file: gmail.ts:126 ~ createFilter ❌ Failed to create filter ~ err:', err);
    return null;
  }
};

// delete previous mail-magic filter with id
const deleteFilter = async (token: string, id: string) => {
  //
  const fetchOptions = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/settings/filters${id}`, fetchOptions);
    console.log(`✅ Successfully deleted filter`);
  } catch (err) {
    console.log(`❌ ~ file: gmail.ts:110 ~ deleteFilter:Failed to delete filter id:${id} ~ err:`, err);
  }
};

//* unsubscribe/block email
const unsubscribe = async ({ token, email }: APIHandleParams) => {
  try {
    // check if mail-magic filter id exists in storage
    const syncStore = await chrome.storage.sync.get(storageKeys.MAIL_MAGIC_FILTER_ID);
    let filterId = '';
    let prevFilterEmails = [''];
    if (syncStore && syncStore.MAIL_MAGIC_FILTER_ID) {
      // mailMagicFilterId found in storage
      // get filter by id and return emails
      const filterEmails = await getFilterById(token, syncStore.MAIL_MAGIC_FILTER_ID);
      filterId = syncStore.MAIL_MAGIC_FILTER_ID;
      prevFilterEmails = filterEmails.emails;
    } else {
      // if mailMagicFilterId not found in storage
      // find mail-magic filter from from users filter (gmail api)
      const filterEmails = await getMailMagicFilter(token);
      if (filterEmails) {
        filterId = filterEmails.filterId;
        prevFilterEmails = filterEmails.emails;
        // set mailMagicFilterId to storage
        await chrome.storage.sync.set({ [storageKeys.MAIL_MAGIC_FILTER_ID]: filterId });
      } else {
        // mailMagicFilter not found - create a new mailMagicFilter with the email to unsubscribe/block
        const newFilterId = await createFilter(token, [MAIL_MAGIC_FILTER_EMAIL, email]);
        // set mailMagicFilterId to storage
        await chrome.storage.sync.set({ [storageKeys.MAIL_MAGIC_FILTER_ID]: newFilterId });
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

type IGmailMessage = {
  id: string;
  threadId: string;
};
type APIResponseSuccess = {
  messages: IGmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
};

const deleteAllMails = async ({ token, email }: APIHandleParams) => {
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

  let parsedRes: APIResponseSuccess | null = null;

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
};

const unsubscribeAndDeleteAllMails = async (email: string, token: string) => {
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

  console.log('🚀 ~ file: gmail.ts:321 ~ getSenderEmailsFromIds ~ requestBody:', requestBody);

  const fetchOptions = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/mixed; boundary=${boundary}`,
    },
    body: requestBody,
  };

  console.log('🚀 ~ getSenderEmailsFromIds ~ fetchOptions:', fetchOptions);

  try {
    const res = await fetch(`https://gmail.googleapis.com/batch/gmail/v1`, fetchOptions);

    if (res.ok) {
      // Read the response text as multipart/mixed
      const responseText = await res.text();

      console.log('🚀 ~ file: gmail.ts:344 ~ getSenderEmailsFromIds ~ responseText:', responseText);

      // regular expression pattern to match email addresses
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

      // Use the match method to find all email addresses in the response string
      const emailAddresses = responseText.replaceAll('u003c', '').match(emailPattern);

      if (emailAddresses) {
        // remove duplicates emails
        const uniqueEmails = [...new Set(emailAddresses)];

        console.log('🚀 ~ file: gmail.ts:352 ~ getSenderEmailsFromIds ~ uniqueEmails:', uniqueEmails);
        return uniqueEmails;
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
  const newsletterEmails = [''];

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
      console.log('🚀 ~ file: gmail.ts:408 ~ getNewsletterEmails ~ nextPageToken:', nextPageToken);

      // console.log('🚀 ~ file: gmail.ts:385 ~ getNewsletterEmails ~ parsedRes:', parsedRes);

      // dividing the messageIds into batches ~
      // so we can use the gmail batch api to group multiple requests into on
      const BATCH_SIZE = 45;

      // create batches of emails
      for (let i = 0; i < parsedRes.messages.length; i += BATCH_SIZE) {
        // if last batch is not more than half of batch size then add to previous batch
        batches.push(parsedRes.messages.slice(i, i + BATCH_SIZE).map(msg => msg.id));
      }
      //  end of do while loop...

      console.log('🚀 ~ file: gmail.ts:396 ~ getNewsletterEmails ~ batches:', batches);

      // process batches to get newsletter emails
      for (const batch of batches) {
        console.log('🚀 ~ file: gmail.ts:406 ~ getNewsletterEmails ~ batch:', batch);

        // get sender emails from the message ids queried
        const senderEmails = await getSenderEmailsFromIds({
          messageIds: batch,
          token,
        });
        if (senderEmails) {
          // checking if emails are already unsubscribed
          const syncStorageData = await chrome.storage.sync.get(storageKeys.UNSUBSCRIBED_EMAILS);

          if (
            syncStorageData[storageKeys.UNSUBSCRIBED_EMAILS] &&
            syncStorageData[storageKeys.UNSUBSCRIBED_EMAILS].length > 0
          ) {
            // filter emails that are not already unsubscribed
            const filteredEmails = senderEmails.filter(
              email => !syncStorageData[storageKeys.UNSUBSCRIBED_EMAILS].includes(email)
            );
            // store the filtered emails
            newsletterEmails.push(...filteredEmails);
          } else {
            // store the emails
            newsletterEmails.push(...senderEmails);
          }
        }
      }
    } while (nextPageToken !== null && newsletterEmails.length < 100);

    console.log('🚀 ~ file: gmail.ts:459 ~ getNewsletterEmails ~ nextPageToken:', nextPageToken);

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
