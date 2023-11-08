import { API_MAX_RESULT } from '@src/pages/background/constants/app.constants';
import type { GetMsgAPIResponseSuccess, SearchFormData } from '@src/pages/background/types/background.types';
import { logger } from '@src/pages/background/utils/logger';

export const advanceSearch = async (token: string, formData: SearchFormData) => {
  const { keyword, afterDate, beforeDate, isRead, isUnRead } = formData;

  const fetchOptions: Partial<RequestInit> = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  // keyword query to search for emails that has this keyword in the subject or body
  const keywordQuery = keyword
    ? `(${keyword
        .split(',')
        .map((word, idx) => (idx === 0 ? `${word}` : ` ${word}`))
        .join('')})`
    : '';

  // build a search query based from the data provided by the user
  // search operators for gmail (same as gmail web app):
  //LINK - https://support.google.com/mail/answer/7190?hl=en

  const searchQuery = ` ${keywordQuery} 
    ${afterDate ? `after:${afterDate}` : ''} 
    ${beforeDate ? `before:${beforeDate}` : ''} 
    ${isRead ? `is:read` : ''} 
    ${isUnRead ? `is:unread` : ''}
    `.replace(/\n/g, ' ');

  console.log('🚀 ~ file: advanceSearch.ts:24 ~ advanceSearch ~ searchQuery:', searchQuery);

  let nextPageToken: string | null = null;

  const messageIds: string[] = [];

  try {
    //  a do white loop to fetch all the messages ids that matches the search query
    // the gmail sends max 500 messages at a time, so we need to loop till we get all the messages ids
    do {
      // call gmail api
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${searchQuery}&maxResults=${API_MAX_RESULT}&${
          nextPageToken ? `&pageToken=${nextPageToken}` : ''
        }`,
        fetchOptions
      );

      // parse response
      const parsedRes: GetMsgAPIResponseSuccess = await res.json();

      console.log('🚀 ~ file: advanceSearch.ts:44 ~ parsedRes:', parsedRes);

      if (!parsedRes.messages) {
        logger.info(
          '🙌 No newsletter emails found.',
          'background/services/api/gmail/handler/getNewsletterEmailsOnPage.ts:44 ~ getNewsletterEmailsOnPage()'
        );
        return [];
      }

      // save next page token if present to fetch next batch of messages
      if (parsedRes.nextPageToken) {
        nextPageToken = parsedRes.nextPageToken;
      } else {
        nextPageToken = null;
      }

      // get email/message ids from the response
      const extractedIds = parsedRes.messages.map(msg => msg.id);

      console.log('🚀 ~ file: advanceSearch.ts:75 ~ extractedIds:', extractedIds.length);

      // store new message ids
      messageIds.push(...extractedIds);
      // end of do white loop
    } while (nextPageToken !== null);

    console.log('🚀 ~ file: advanceSearch.ts:66 ~ messageIds:', messageIds.length);

    return messageIds;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error while getting newsletter emails',
      fileTrace: 'background/services/api/gmail/handler/advanceSearch.ts:100 advanceSearch() catch block',
    });
    return [];
  }
};
