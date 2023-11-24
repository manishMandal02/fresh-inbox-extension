import { logger } from './../../../../utils/logger';
import { API_MAX_RESULT } from '@src/pages/background/constants/app.constants';
import type { APIHandleParams, GetMsgAPIResponse } from '@src/pages/background/types/background.types';
import { batchDeleteMails } from '../helper/batchDelete';
import { apiErrorHandler } from '@src/pages/background/utils/apiErrorHandler';

// delete all mails
export const deleteAllMails = async ({ userToken, emails }: APIHandleParams) => {
  try {
    const fetchOptions: Partial<RequestInit> = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    };

    let nextPageToken: string | null = null;
    // search query to get all emails/message ids of these emails
    const queryParams = `from:(${emails
      .map(email => `${email}`)
      .join(' OR ')}) &maxResults=${API_MAX_RESULT}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;

    let parsedRes: GetMsgAPIResponse | null = null;

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

      // handle api errors
      apiErrorHandler(parsedRes);

      // stop if no messages found
      if (!parsedRes.messages) {
        throw new Error('❌ Failed to get gmail message ids');
      }

      if (parsedRes.messages.length < 1) {
        logger.info(
          'No messages found',
          'background/services/api/gmail/handler/deleteAllMails.ts:73 ~ deleteAllMails()'
        );
      }

      // save next page userToken if present to fetch next batch of messages
      if (parsedRes.nextPageToken) {
        nextPageToken = parsedRes.nextPageToken;
      } else {
        nextPageToken = null;
      }

      // get message ids from success response
      const msgIds = parsedRes.messages.map(msg => msg.id);

      // batch delete messages/emails
      await batchDeleteMails(userToken, msgIds);
      logger.info(
        `✅ Batch delete successful, deleted ${msgIds.length} mails`,
        'background/services/api/gmail/handler/deleteAllMails.ts:93 ~ deleteAllMails()'
      );
      //* end of do...while loop
    } while (nextPageToken !== null);
    return true;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error while batch deleting emails',
      fileTrace: 'background/services/api/gmail/handler/deeAllMails.ts:30 batchDeleteMails() catch block',
    });
    return false;
  }
};
