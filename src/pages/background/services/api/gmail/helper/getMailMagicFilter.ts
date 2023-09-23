import {
  FILTER_ACTION,
  FilterEmails,
  GmailFilter,
  GmailFilters,
} from '@src/pages/background/types/background.types';
import { getEmailsFromFilterQuery } from './getEmailsFromFilterQuery';
import { MAIL_MAGIC_FILTER_EMAIL } from '@src/pages/background/constants/app.constants';

// check if filter is mail mail magic filter (TRASH or INBOX filter created by mail magic)

const isMailMagicFilter = (filter: GmailFilter, filterAction: FILTER_ACTION): boolean => {
  const labelId = filterAction === FILTER_ACTION.TRASH ? ['TRASH'] : ['SPAM'];

  const checkCondition = () => {
    // check for filter based on labels/action

    if (labelId.length[0] === FILTER_ACTION.TRASH) {
      // check for TRASH filter
      return filter.action.addLabelIds.length === 1 && filter.action.addLabelIds[0] === labelId[0];
    } else {
      // check for INBOX filter
      return (
        filter.action.removeLabelIds.length === 2 &&
        filter.action.removeLabelIds[0] === labelId[0] &&
        filter.action.removeLabelIds[1] === labelId[1]
      );
    }
  };

  return checkCondition();
};

type GetMailMagicFilterParams = {
  token: string;
  filterAction?: FILTER_ACTION;
};

// get mail-magic filter id also return all emails optionally
export const getMailMagicFilter = async ({
  token,
  filterAction = FILTER_ACTION.TRASH,
}: GetMailMagicFilterParams): Promise<FilterEmails | null> => {
  const fetchOptions = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/settings/filters', fetchOptions);
    const parsedRes: GmailFilters | null = await res.json();

    console.log('🚀 ~ file: getMailMagicFilter.ts:26 ~ parsedRes:', parsedRes);

    if (!parsedRes.filter) throw new Error('Failed to get filters');

    let filterId = '';
    let emails: string[] = [];

    for (const filter of parsedRes.filter) {
      console.log('🚀 ~ file: getMailMagicFilter.ts:35 ~ filter:', filter);

      if (isMailMagicFilter(filter, filterAction)) {
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
