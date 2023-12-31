import { FILTER_ACTION, FilterEmails, GmailFilter } from '@src/pages/background/types/background.types';
import { getEmailsFromFilterQuery } from './getEmailsFromFilterQuery';
import { FRESH_INBOX_FILTER_EMAIL } from '@src/pages/background/constants/app.constants';
import { logger } from '@src/pages/background/utils/logger';
import { apiErrorHandler } from '@src/pages/background/utils/apiErrorHandler';

// get  filter by Id
export const getFilterById = async (userToken: string, id: string): Promise<FilterEmails | null> => {
  const fetchOptions: Partial<RequestInit> = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  };
  try {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/settings/filters/${id}`,
      fetchOptions
    );

    const parsedRes: GmailFilter | null = await res.json();

    // handle api errors
    apiErrorHandler(parsedRes);

    if (!parsedRes.id) {
      throw new Error('❌ Filter not found');
    }

    if (!parsedRes?.criteria.query) throw new Error('❌ Failed to get filters');

    // get emails from query
    let emails = getEmailsFromFilterQuery(parsedRes.criteria.query);

    // remove fresh-Inbox identity email from  emails

    emails = emails.filter(email => email !== FRESH_INBOX_FILTER_EMAIL);

    return { emails, filterId: parsedRes.id };
  } catch (error) {
    logger.error({
      error,
      msg: 'Error getting filter by id',
      fileTrace: 'background/services/api/gmail/helper/gmailFilters.ts:40 ~ getFilterById() catch block',
    });
    return null;
  }
};

type CreateFilterParams = {
  userToken: string;
  emails: string[];
  filterAction: FILTER_ACTION;
};

// create filter with fresh-Inbox email get emails array
export const createFilter = async ({
  userToken,
  emails,
  filterAction,
}: CreateFilterParams): Promise<string | null> => {
  //
  const emailsList = emails;

  // if the emails doesn't include fresh-Inbox identity email, add it
  if (emailsList.indexOf(FRESH_INBOX_FILTER_EMAIL) === -1) {
    emailsList.unshift(FRESH_INBOX_FILTER_EMAIL);
  }

  // format the emails into a single query string for filter criteria
  const criteriaQuery = `from:(${emailsList.map(email => email).join(' OR ')})`;

  //* explanation of labels/action
  // addLabelIds adds label to the email present in the filter (here TRASH label will be added to the unsubscribed email)

  // removeLabelIds removes label to the email present in the filter (here SPAM label will be removed from the whitelisted email)

  const dynamicFilterAction =
    filterAction === FILTER_ACTION.TRASH ? { addLabelIds: ['TRASH'] } : { removeLabelIds: ['SPAM'] };

  const fetchOptions: Partial<RequestInit> = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: dynamicFilterAction,
      criteria: {
        query: criteriaQuery,
      },
    }),
  };

  try {
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/settings/filters`, fetchOptions);

    const parsedRes: GmailFilter = await res.json();

    // handle api errors
    apiErrorHandler(parsedRes);

    logger.info(
      '✅ Successfully created filter',
      'background/services/api/gmail/helper/gmailFilters.ts:98 ~ createFilter()'
    );

    return parsedRes.id;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error creating filter',
      fileTrace: 'background/services/api/gmail/helper/gmailFilters.ts:106 ~ createFilter() catch block',
    });
    return null;
  }
};

// delete previous fresh-Inbox filter with id
export const deleteFilter = async (userToken: string, id: string) => {
  //
  const fetchOptions: Partial<RequestInit> = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  };
  try {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/settings/filters/${id}`,
      fetchOptions
    );

    const parsedRes = await res.json();

    // handle api errors
    apiErrorHandler(parsedRes);

    logger.info(
      '✅ Successfully deleted filter',
      'background/services/api/gmail/helper/gmailFilters.ts:127 ~ deleteFilter()'
    );
  } catch (error) {
    logger.error({
      error,
      msg: 'Error deleting filter',
      fileTrace: 'background/services/api/gmail/helper/gmailFilters.ts:133 ~ deleteFilter() catch block',
    });
  }
};
