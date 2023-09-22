import { FILTER_ACTION, FilterEmails, GmailFilter } from '@src/pages/background/types/background.types';
import { getEmailsFromFilterQuery } from './getEmailsFromFilterQuery';

// get  filter by Id
export const getFilterById = async (token: string, id: string): Promise<FilterEmails | null> => {
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

    console.log('🚀 ~ file: gmailFilters.ts:19 ~ getFilterById ~ parsedRes:', parsedRes);

    if (!parsedRes.id) {
      throw new Error('❌ Filter not found');
    }

    if (!parsedRes || !parsedRes.criteria.query) throw new Error('❌ Failed to get filters');

    // get emails from query
    const emails = getEmailsFromFilterQuery(parsedRes.criteria.query);

    return { emails };
  } catch (err) {
    console.log('🚀 ~ file: gmail.ts:25 ~ checkForTrashFilter: ❌ Failed get filters ~ err:', err);
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
        addLabelIds: [filterAction],
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

    console.log('🚀 ~ file: gmailFilters.ts:74 ~ newFilter:', newFilter);

    return newFilter.id;
  } catch (err) {
    console.log('🚀 ~ file: gmail.ts:126 ~ createFilter ❌ Failed to create filter ~ err:', err);
    return null;
  }
};

// delete previous mail-magic filter with id
export const deleteFilter = async (token: string, id: string) => {
  //
  const fetchOptions = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/settings/filters/${id}`, fetchOptions);
    console.log(`✅ Successfully deleted filter`);
  } catch (err) {
    console.log(`❌ ~ file: gmail.ts:110 ~ deleteFilter:Failed to delete filter id:${id} ~ err:`, err);
  }
};
