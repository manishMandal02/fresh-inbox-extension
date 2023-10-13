//* the refresh button doesn't have a consistent selector to target it

import { logger } from './logger';

const dispatchClickEvent = (el: Element) => {
  // Simulate a mousedown event
  const mousedownEvent = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  el.dispatchEvent(mousedownEvent);

  // Simulate a mouseup event
  const mouseupEvent = new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  el.dispatchEvent(mouseupEvent);

  // Simulate a mouseout event
  const mouseoutEvent = new MouseEvent('mouseout', {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  el.dispatchEvent(mouseoutEvent);
};

export const refreshEmailsTable = () => {
  const refreshBtnSelectors = ['div[title="Refresh"]', '[aria-label="Refresh"]', '[data-tooltip="Refresh"]'];
  return new Promise<string>((resolve, reject) => {
    let refreshBtn: HTMLDivElement | null = null;
    // loop through selectors to find refresh button
    for (const selector of refreshBtnSelectors) {
      if (document.querySelector(selector)) {
        refreshBtn = document.querySelector(selector);
        break;
      }
    }

    if (!refreshBtn) {
      logger.error({
        error: new Error('❌ refresh button not found'),
        msg: 'Refresh button not found',
        fileTrace: 'content/utils/dispatchClickEvents.ts:47 ~ refreshEmailsTable()',
      });
      reject(new Error(' refresh button not found'));
    }
    // simulate a click event on refresh table button
    dispatchClickEvent(refreshBtn);

    resolve('success');
  });
};

// go back to inbox btn selectors
// [['data-tooltip="Back to Inbox"'], ['aria-label="Back to Inbox"']]

export const goBackToInbox = () => {
  const goBackToInboxBtnSelectors = ['div[data-tooltip="Back to Inbox"]', 'div[aria-label="Back to Inbox"]'];
  return new Promise<string>((resolve, reject) => {
    let goBackToInboxBtn: HTMLDivElement | null = null;

    // loop through selectors to find go back to inbox button
    for (const selector of goBackToInboxBtnSelectors) {
      if (document.querySelector(selector)) {
        goBackToInboxBtn = document.querySelector(selector);
        break;
      }
    }

    if (!goBackToInboxBtn) {
      logger.error({
        error: new Error('❌ button not found'),
        msg: 'Go back to inbox button not found',
        fileTrace: 'content/utils/dispatchClickEvents.ts:78 ~ goBackToInbox()',
      });
      reject(new Error('Go back to inbox button not found'));
    }

    dispatchClickEvent(goBackToInboxBtn);

    resolve('success');
  });
};
