import { IMessageEvent, type DataOnPage, IMessageBody } from '@src/pages/content/types/content.types';
import { logger } from '@src/pages/content/utils/logger';

type GenerateStorageKeyProps = Pick<DataOnPage, 'category' | 'dateRange' | 'folder'>;

// generate session storage key from search query props
const generateStorageKey = ({ dateRange, category, folder }: GenerateStorageKeyProps) =>
  `${freshInboxGlobalVariables.userEmail}-${dateRange.startDate}-${dateRange.endDate}-${folder}-${
    category || '0'
  }`;

export const identifyOnPageNewsletterEmails = async ({
  emails,
  dateRange,
  folder,
  category,
}: DataOnPage): Promise<string[]> => {
  //
  // create session storage key with all the search query data
  const key = generateStorageKey({ dateRange, folder, category });

  // check if the emails data are cached in session storage
  const newsletterEmails = sessionStorage.getItem(key);

  if (newsletterEmails) {
    // cache data found in session storage
    return JSON.parse(newsletterEmails);
  } else {
    // no cache data, fetch data from background script
    const res = await chrome.runtime.sendMessage<IMessageBody>({
      event: IMessageEvent.GET_NEWSLETTER_EMAILS_ON_PAGE,
      dataOnPage: {
        emails,
        dateRange,
        category,
        folder,
      },
    });

    // save data to session storage
    sessionStorage.setItem(key, JSON.stringify(res));

    if (res) return res;
  }

  logger.error({
    error: new Error('Failed to get on page newsletter emails'),
    msg: 'Failed to get on page newsletter data from cache or background script',
    fileTrace: 'content/view/assistant-button/helper/identifyOnPageNewsletterEmails',
  });
  return [];
};
