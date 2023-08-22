import { MAIL_MAGIC_FILTER_EMAIL, storageKeys } from '@src/constants/app.constants';
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

//TODO: get  filter by Id
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

//TODO: get mail-magic filter id also return all emails optionally
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

//TODO: create filter with mail-magic email get emails array
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

//TODO: delete previous mail-magic filter with id
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
    const storage = await chrome.storage.sync.get(storageKeys.mailMagicFilterId);
    let filterId = '';
    let prevFilterEmails = [''];
    if (storage && storage.mailMagicFilterId) {
      // mailMagicFilterId found in storage
      // get filter by id and return emails
      const filterEmails = await getFilterById(token, storage.mailMagicFilterId);
      filterId = storage.mailMagicFilterId;
      prevFilterEmails = filterEmails.emails;
    } else {
      // if mailMagicFilterId not found in storage
      // find mail-magic filter from from users filter (gmail api)
      const filterEmails = await getMailMagicFilter(token);
      if (filterEmails) {
        filterId = filterEmails.filterId;
        prevFilterEmails = filterEmails.emails;
        // set mailMagicFilterId to storage
        await chrome.storage.sync.set({ [storageKeys.mailMagicFilterId]: filterId });
      } else {
        // mailMagicFilter not found - create a new mailMagicFilter
        const newFilterId = await createFilter(token, [MAIL_MAGIC_FILTER_EMAIL]);
        // set mailMagicFilterId to storage
        await chrome.storage.sync.set({ [storageKeys.mailMagicFilterId]: filterId });
      }
    }

    // add the new email to unsubscribe/block filter
    prevFilterEmails.push(email);

    // create new mail-magic filter with emails from previous filter and add new email
    await createFilter(token, prevFilterEmails);

    //TODO: save the unsubscribed email to storage

    //
    //TODO: delete previous mail-magic filter
  } catch (err) {
    console.log('🚀 ~ file: gmail.ts:152 ~ unsubscribe ❌ Failed to unsubscribe ~ err:', err);
  }
};

// * delete all mails/messages

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

  const queryParams = `from:${email}&maxResults=${API_MAX_RESULT}`;

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
    }

    // get message ids from success response
    const msgIds = parsedRes.messages.map(msg => msg.id);

    // batch delete messages/emails
    await batchDeleteEmails(token, msgIds);
  } while (nextPageToken !== null);
  //* end of do...while loop
};

const unsubscribeAndDeleteAllMails = async (email: string, token: string) => {};

export { unsubscribe, deleteAllMails };
