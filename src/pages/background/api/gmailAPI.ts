const API_MAX_RESULT = 500;

type IGmailMessage = {
  id: string;
  threadId: string;
};
type APIResponseSuccess = {
  messages: IGmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
};

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

const unsubscribe = async (email: string, token: string) => {};

const deleteAllMails = async (email: string, token: string) => {
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
