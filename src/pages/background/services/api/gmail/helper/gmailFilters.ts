import { FILTER_ACTION, FilterEmails, GmailFilter } from '@src/pages/background/types/background.types';
import { getEmailsFromFilterQuery } from './getEmailsFromFilterQuery';
import { MAIL_MAGIC_FILTER_EMAIL } from '@src/pages/background/constants/app.constants';

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

    if (!parsedRes.id) {
      throw new Error('❌ Filter not found');
    }

    if (!parsedRes || !parsedRes.criteria.query) throw new Error('❌ Failed to get filters');

    // get emails from query
    let emails = getEmailsFromFilterQuery(parsedRes.criteria.query);

    // remove mail-magic identity email from  emails

    emails = emails.filter(email => email !== MAIL_MAGIC_FILTER_EMAIL);

    return { emails, filterId: parsedRes.id };
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

  const fetchOptions = {
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

    console.log('🚀 ~ file: gmailFilters.ts:74 ~ newFilter:', newFilter);

    console.log(`✅ Successfully created filter`);
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
