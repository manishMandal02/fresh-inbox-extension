import { MAIL_NODES_SELECTOR } from '@src/pages/content/constants/app.constants';
import type { DateRange, EmailId } from '../../../types/content.types';
import { getDateRangeFromNodes } from '@src/pages/content/view/assistantButton/helper/getDateRangeFromNodes';
import { logger } from '@src/pages/content/utils/logger';

type GetAllMailsOnPageReturn = {
  emails: EmailId[];
  dateRange?: DateRange;
  allMailNodes?: Element[];
};

// get all the mails with ids on the page
export const getAllMailsOnPage = (): GetAllMailsOnPageReturn => {
  // get all mail nodes on current page in the table by email attribute
  let allMailNodes = Array.from(document.querySelectorAll(MAIL_NODES_SELECTOR));

  console.log(
    '🚀 ~ file: getMailsOnPage.ts:29 ~ getAllMailsOnPage ~ allMailNodes.length:: before',
    allMailNodes.length
  );

  if (allMailNodes.length < 1) {
    logger.error({
      error: new Error('❌ No emails (nodes) found on this page.'),
      msg: 'No emails (nodes) found on this page.',
      fileTrace: 'content/view/assistantButton/helper/getAllMailsOnPage.ts:22 ~ getAllMailsOnPage()',
    });
    return { emails: [] };
  }

  // select only the nodes that are currently visible on the page
  allMailNodes = allMailNodes.filter(node => node.checkVisibility());

  console.log(
    '🚀 ~ file: getMailsOnPage.ts:29 ~ getAllMailsOnPage ~ allMailNodes.length:: after',
    allMailNodes.length
  );

  // date range
  const dateRange = getDateRangeFromNodes(allMailNodes);

  // get email and name from each mail node
  let allEmailsOnPage: EmailId[] = [];

  allMailNodes.forEach((mailNode, idx) => {
    if (!mailNode.getAttribute('email')) return;

    const email = mailNode.getAttribute('email');

    // if duplicate node, remove it from the main array
    if ([...allMailNodes.filter(node => mailNode.isEqualNode(node))].length > 1) {
      // remove this duplicate node from array
      allEmailsOnPage.splice(idx, 1);
      return;
    }

    const idNode = mailNode
      .closest('td')
      .nextElementSibling.querySelector('span[data-legacy-last-message-id]');
    const id = idNode.getAttribute('data-legacy-last-message-id');
    allEmailsOnPage.push({ email, id });
  });

  // return only non null values
  allEmailsOnPage = allEmailsOnPage.filter(email => email);
  return { emails: allEmailsOnPage, dateRange, allMailNodes };
};
