import { API_MAX_RESULT } from '@src/pages/background/constants/app.constants';
import { APIHandleParams, GetMsgAPIResponseSuccess } from '@src/pages/background/types/background.types';

// delete all mails in batches for faster processing
const batchDeleteMails = async (token: string, ids: string[]) => {
  // added TRASH label, remove INBOX label for all the emails/messages
  const reqBody = {
    ids,
    addLabelIds: ['TRASH'],
    removeLabelIds: ['INBOX'],
  };

  const fetchOptions: Partial<RequestInit> = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reqBody),
  };

  try {
    // batch delete emails
    await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify', fetchOptions);
  } catch (err) {
    console.log('🚀 ~ file: deleteAllMails.ts:23 ~ batchDeleteEmails: Failed to batch delete: ~ err:', err);
  }
};

// delete all mails
export const deleteAllMails = async ({ token, email }: APIHandleParams) => {
  try {
    const fetchOptions: Partial<RequestInit> = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    let nextPageToken: string | null = null;

    const queryParams = `from:${email}&maxResults=${API_MAX_RESULT}${
      nextPageToken ? `&pageToken=${nextPageToken}` : ''
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
      // parse res
      parsedRes = await res.json();

      // stop if no messages found
      if (!parsedRes.messages) {
        throw new Error('❌ Failed to get gmail message ids');
      }

      if (parsedRes.messages.length < 1) {
        return;
      }

      console.log('🚀 ~ file: deleteAllMails.ts:23 ~ deleteAllMails ~ messages:', parsedRes);

      // save next page token if present to fetch next batch of messages
      if (parsedRes.nextPageToken) {
        nextPageToken = parsedRes.nextPageToken;
      } else {
        nextPageToken = null;
      }

      // get message ids from success response
      const msgIds = parsedRes.messages.map(msg => msg.id);

      // batch delete messages/emails
      await batchDeleteMails(token, msgIds);
      console.log(`✅ batch delete successful, deleted ${msgIds.length} mails`);
      //* end of do...while loop
    } while (nextPageToken !== null);
    return true;
  } catch (err) {
    console.log('🚀 ~ file: deleteAllMails.ts:86 ~ deleteAllMails ~ err:', err);
    return false;
  }
};
