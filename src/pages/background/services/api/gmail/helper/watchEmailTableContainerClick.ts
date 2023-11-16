import type { AsyncCallback } from '@src/pages/content/types/content.types';
import { asyncHandler } from '@src/pages/content/utils/asyncHandler';
import { logger } from '@src/pages/content/utils/logger';
import { retryAtIntervals } from '@src/pages/content/utils/retryAtIntervals';
import wait from '@src/pages/content/utils/wait';

// top most container for inbox and also the single email container
const getEmailsTableContainer = () => {
  // gmail table's top container's full path
  // it's either of the 2 (keeps changing randomly)
  const containerXPaths = [
    '/html/body/div[7]/div[3]/div/div[2]/div[2]/div/div/div',
    '/html/body/div[8]/div[3]/div/div[2]/div[2]/div/div',
  ];

  let tableContainer: Node | null = null;

  // loop the x-paths to get the table container
  for (const xPath of containerXPaths) {
    tableContainer = document.evaluate(
      xPath,
      // Context node
      document,
      // Namespace resolver
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;

    //  break the loop it table container found
    if (tableContainer) break;
  }

  return tableContainer;
};

// watch for main container click (if a single is opened or navigated to diff categories)
// re-embed assistant button based on the container (weather it is an inbox or a single email)
export const watchEmailTableContainerClick = async (callback: AsyncCallback) => {
  let emailsContainer: Node | null = null;

  // retry to check if the emails are found on page or not
  // if not, then retry it for 3 times with 2 seconds interval
  await retryAtIntervals<boolean>({
    retries: 3,
    interval: 2000,
    callback: async () => {
      const topContainer = getEmailsTableContainer();

      if (topContainer) {
        emailsContainer = topContainer;
        return true;
      }
      return false;
    },
  });

  if (!emailsContainer) {
    logger.info('Email Container not found', 'content/app/index.tsx:76');
    return;
  }

  const handleContainerClick = async () => {
    await wait(1000);

    await callback();
  };

  // // list to on click
  emailsContainer.addEventListener('click', asyncHandler(handleContainerClick));

  // list to mouse up
  // emailsContainer.addEventListener('mouseup', asyncHandler(handleContainerClick));
};
