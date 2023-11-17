import {
  FILTER_ACTION,
  FilterEmails,
  GmailFilter,
  GmailFilters,
} from '@src/pages/background/types/background.types';
import { getEmailsFromFilterQuery } from './getEmailsFromFilterQuery';
import { FRESH_INBOX_FILTER_EMAIL } from '@src/pages/background/constants/app.constants';
import { logger } from '@src/pages/background/utils/logger';

// check if filter is app filter (TRASH or INBOX filter created by fresh inbox)
const isFreshInboxFilter = (filter: GmailFilter, filterAction: FILTER_ACTION): boolean => {
  const labelId = filterAction === FILTER_ACTION.TRASH ? 'TRASH' : 'SPAM';

  const checkCondition = () => {
    // check for filter based on labels/action
    if (labelId === 'TRASH') {
      // check for TRASH filter
      return filter.action?.addLabelIds?.length === 1 && filter.action.addLabelIds[0] === labelId;
    } else {
      // check for INBOX filter
      return filter.action?.removeLabelIds?.length === 1 && filter.action.removeLabelIds[0] === labelId;
    }
  };

  return !!checkCondition();
};

type GetFreshInboxFilterParams = {
  token: string;
  filterAction?: FILTER_ACTION;
};

// get fresh-Inbox filter id also return all emails optionally
export const getFreshInboxFilter = async ({
  token,
  filterAction = FILTER_ACTION.TRASH,
}: GetFreshInboxFilterParams): Promise<FilterEmails | null> => {
  const fetchOptions: Partial<RequestInit> = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/settings/filters', fetchOptions);
    const parsedRes: GmailFilters | null = await res.json();

    if (!parsedRes.filter) throw new Error('Failed to get filters');

    let filterId = '';
    let emails: string[] = [];

    for (const filter of parsedRes.filter) {
      // check if this filter is a fresh-inbox filter (we only check for matching labels/actions here)
      if (!isFreshInboxFilter(filter, filterAction)) continue;

      // if yes,  get emails from the filter criteria
      const queryEmails = getEmailsFromFilterQuery(filter.criteria.query);

      // check if this filter has the fresh-inbox filter identity email
      if (queryEmails.includes(FRESH_INBOX_FILTER_EMAIL)) {
        filterId = filter.id;
        emails = queryEmails;
        // stop the loop
        break;
      }
    }

    if (filterId) {
      return {
        filterId,
        emails,
      };
    } else {
      throw new Error('App filter not found');
    }
  } catch (error) {
    logger.error({
      error,
      msg: 'Error finding app filter',
      fileTrace:
        'background/services/api/gmail/helper/getFreshInboxFilter.ts:85 ~ getFreshInboxFilter() catch block',
    });
    return null;
  }
};
