import { MAIL_NODES_SELECTOR } from '@src/pages/content/constants/app.constants';
import type { DateRange, EmailId } from '../../../types/content.types';
import { logger } from '@src/pages/content/utils/logger';
import { getDateRangeFromNodes } from './getDateRangeFromNodes';

type GetAllMailsOnPageReturn = {
  emails: EmailId[];
  dateRange?: DateRange;
  allMailNodes?: Element[];
};

// get all the mails with ids on the page
export const getAllMailsOnPage = (): GetAllMailsOnPageReturn => {
  // get all mail nodes on current page of the table by email attribute
  let allMailNodes = Array.from(document.querySelectorAll(MAIL_NODES_SELECTOR));

  if (allMailNodes.length < 1) {
    logger.error({
      error: new Error('❌ No emails (nodes) found on this page.'),
      msg: 'No emails (nodes) found on this page.',
      fileTrace: 'content/view/assistantButton/helper/getAllMailsOnPage.ts:22 ~ getAllMailsOnPage()',
    });
    return { emails: [] };
  }

  // select only the nodes that are currently visible on the page
  //@ts-ignore
  allMailNodes = allMailNodes.filter(node => node.checkVisibility());

  // date range
  const dateRange = getDateRangeFromNodes(allMailNodes);

  // get email and name from each mail node
  let allEmailsOnPage: EmailId[] = [];

  allMailNodes.forEach(mailNode => {
    if (!mailNode.getAttribute('email')) return;

    const email = mailNode.getAttribute('email');

    // get id node from mail node
    const idNode = mailNode
      .closest('td')
      .nextElementSibling.querySelector('span[data-legacy-last-message-id]');

    // extract the id
    const id = idNode.getAttribute('data-legacy-last-message-id');

    allEmailsOnPage.push({ email, id });
  });

  // return only non null values
  allEmailsOnPage = allEmailsOnPage.filter(email => email);
  return { emails: allEmailsOnPage, dateRange, allMailNodes };
};
