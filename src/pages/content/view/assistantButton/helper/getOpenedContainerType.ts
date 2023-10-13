import { MAIL_NODES_SELECTOR } from '@src/pages/content/constants/app.constants';

// get the opened container type (inbox or single email)
export const getOpenedContainerType = (): 'inbox' | 'singleEmail' => {
  // checking for single email container
  // check if it has a print mail button
  const printEmailBtn = document.querySelector('button[aria-label="Print all"]');

  if (printEmailBtn) {
    return 'singleEmail';
  }

  // checking for inbox inbox
  // check for row with sender email
  const emailRow = document.querySelector(MAIL_NODES_SELECTOR);

  if (emailRow) {
    return 'inbox';
  }

  return null;
};
