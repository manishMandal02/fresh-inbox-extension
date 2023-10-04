import { error } from 'console';
import {
  FILTER_ACTION,
  FilterEmails,
  GmailFilter,
  GmailFilters,
} from '@src/pages/background/types/background.types';
import { getEmailsFromFilterQuery } from './getEmailsFromFilterQuery';
import { MAIL_MAGIC_FILTER_EMAIL } from '@src/pages/background/constants/app.constants';
import { logger } from '@src/pages/background/utils/logger';

// check if filter is mail mail magic filter (TRASH or INBOX filter created by mail magic)

const isMailMagicFilter = (filter: GmailFilter, filterAction: FILTER_ACTION): boolean => {
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

type GetMailMagicFilterParams = {
  token: string;
  filterAction?: FILTER_ACTION;
};

// get mail-magic filter id also return all emails optionally
export const getMailMagicFilter = async ({
  token,
  filterAction = FILTER_ACTION.TRASH,
}: GetMailMagicFilterParams): Promise<FilterEmails | null> => {
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
  } catch (error) {
    logger.error({
      error,
      msg: 'Error finding mail magic filter',
      fileTrace:
        'background/services/api/gmail/helper/getMailMagicFilter.ts:85 ~ getMailMagicFilter() catch block',
    });
    return null;
  }
};
