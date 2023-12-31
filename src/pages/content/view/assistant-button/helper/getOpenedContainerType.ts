import { MAIL_NODES_SELECTOR } from '@src/pages/content/constants/app.constants';

// get the opened container type (inbox or single email)
export const getOpenedContainerType = (): 'inbox' | 'singleEmail' => {
  // checking for single email container
  // check if it has a print mail button
  const printEmailBtn = document.querySelector('button[aria-label="Print all"]');

  //@ts-ignore
  if (printEmailBtn && printEmailBtn.checkVisibility()) {
    return 'singleEmail';
  }

  // checking for emails table (inbox) container
  // check for row with sender email
  const emailRow = document.querySelectorAll(MAIL_NODES_SELECTOR);

  //@ts-ignore
  if ([...emailRow].find(row => row.checkVisibility())!!) {
    return 'inbox';
  }

  return null;
};
