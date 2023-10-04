import { MAIL_NODES_SELECTOR } from '@src/pages/content/constants/app.constants';
import { DateRange, EmailId } from '../../../content.types';
import { getDateRangeFromNodes } from '@src/pages/content/view/assistantButton/helper/getDateRangeFromNodes';
import { logger } from '@src/pages/content/utils/logger';

// get all the mails with ids on the page
export const getAllMailsOnPage = (): {
  emails: EmailId[];
  dateRange?: DateRange;
  allMailNodes?: Element[];
} => {
  // TODO: check for url, only run for selected labels/folder

  //
  // get all mail nodes on current page in the table by email attribute
  const allMailNodes = Array.from(document.querySelectorAll(MAIL_NODES_SELECTOR));

  if (allMailNodes.length < 1) {
    logger.error({
      error: new Error('❌ No emails (nodes) found on this page.'),
      msg: 'No emails (nodes) found on this page.',
      fileTrace: 'content/view/assistantButton/helper/getAllMailsOnPage.ts:22 ~ getAllMailsOnPage()',
    });
    return { emails: [] };
  }

  // get email and name from each mail node
  let allEmailsOnPage: EmailId[] = allMailNodes.map(mailNode => {
    if (mailNode.getAttribute('email')) {
      const email = mailNode.getAttribute('email');
      const idNode = mailNode
        .closest('td')
        .nextElementSibling.querySelector('span[data-legacy-last-message-id]');
      const id = idNode.getAttribute('data-legacy-last-message-id');
      return { email, id };
    } else {
      return null;
    }
  });

  // date range
  const dateRange = getDateRangeFromNodes(allMailNodes);

  // return only non null values
  allEmailsOnPage = allEmailsOnPage.filter(email => email);
  return { emails: allEmailsOnPage, dateRange, allMailNodes };
};
