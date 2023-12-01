import type { AsyncCallback } from '@src/pages/content/types/content.types';
import { asyncHandler } from '@src/pages/content/utils/asyncHandler';
import { logger } from '@src/pages/content/utils/logger';
import { retryAtIntervals } from '@src/pages/content/utils/retryAtIntervals';
import { throttle } from '@src/pages/content/utils/throttle';
import wait from '@src/pages/content/utils/wait';

// top most container for inbox and also the single email container
const getEmailsTableContainer = () => {
  // gmail table's top container's full path
  // it's either of the 2 (keeps changing randomly)
  let tableContainer: Element | undefined;
  const gmailLeftNavigation = document.querySelector('div[role="navigation"]');

  if (gmailLeftNavigation) {
    tableContainer = gmailLeftNavigation.nextElementSibling.firstElementChild;
  }
  return tableContainer;
};

// watch for main container click (if a single is opened or navigated to diff categories)
// re-embed assistant button based on the container (weather it is an inbox or a single email)
export const watchEmailTableContainerClick = async (callback: AsyncCallback) => {
  let emailsContainer: Element | undefined = null;

  // retry to check if the emails are found on page or not
  // if not, then retry it for 3 times with 2 seconds interval
  await retryAtIntervals<boolean>({
    retries: 4,
    interval: 1500,
    callback: async () => {
      const topContainer = getEmailsTableContainer();

      console.log('🚀 ~ file: watchEmailTableContainerClick.ts:56 ~ callback: ~ topContainer:', topContainer);

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

  const throttledCallback = throttle(callback);

  // // list to on click
  emailsContainer.addEventListener('click', asyncHandler(throttledCallback));

  // list to mouse up
  // emailsContainer.addEventListener('mouseup', asyncHandler(handleContainerClick));
};
