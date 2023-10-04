import { FILTER_ACTION, FilterEmails, GmailFilter } from '@src/pages/background/types/background.types';
import { getEmailsFromFilterQuery } from './getEmailsFromFilterQuery';
import { MAIL_MAGIC_FILTER_EMAIL } from '@src/pages/background/constants/app.constants';
import { logger } from '@src/pages/background/utils/logger';

// get  filter by Id
export const getFilterById = async (token: string, id: string): Promise<FilterEmails | null> => {
  const fetchOptions: Partial<RequestInit> = {
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

    if (!parsedRes.id) {
      throw new Error('❌ Filter not found');
    }

    if (!parsedRes || !parsedRes.criteria.query) throw new Error('❌ Failed to get filters');

    // get emails from query
    let emails = getEmailsFromFilterQuery(parsedRes.criteria.query);

    // remove mail-magic identity email from  emails

    emails = emails.filter(email => email !== MAIL_MAGIC_FILTER_EMAIL);

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
  token: string;
  emails: string[];
  filterAction: FILTER_ACTION;
};

// create filter with mail-magic email get emails array
export const createFilter = async ({
  token,
  emails,
  filterAction,
}: CreateFilterParams): Promise<string | null> => {
  //
  const emailsList = emails;

  // if the emails doesn't include mail-magic identity email, add it
  if (emailsList.indexOf(MAIL_MAGIC_FILTER_EMAIL) === -1) {
    emailsList.unshift(MAIL_MAGIC_FILTER_EMAIL);
  }

  // format the emails into a single query string for filter criteria
  const criteriaQuery = `from:(${emailsList.map(email => `${email}`).join(' OR ')})`;

  //* explanation of labels/action
  // addLabelIds adds label to the email present in the filter (here TRASH label will be added to the unsubscribed email)

  // removeLabelIds removes label to the email present in the filter (here SPAM label will be removed from the whitelisted email)

  const dynamicFilterAction =
    filterAction === FILTER_ACTION.TRASH ? { addLabelIds: ['TRASH'] } : { removeLabelIds: ['SPAM'] };

  const fetchOptions: Partial<RequestInit> = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
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

    const newFilter: GmailFilter = await res.json();

    logger.info(
      '✅ Successfully created filter',
      'background/services/api/gmail/helper/gmailFilters.ts:98 ~ createFilter()'
    );

    return newFilter.id;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error creating filter',
      fileTrace: 'background/services/api/gmail/helper/gmailFilters.ts:106 ~ createFilter() catch block',
    });
    return null;
  }
};

// delete previous mail-magic filter with id
export const deleteFilter = async (token: string, id: string) => {
  //
  const fetchOptions: Partial<RequestInit> = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/settings/filters/${id}`, fetchOptions);

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
