//* the refresh button doesn't have a consistent selector to target it

import { logger } from '../../../utils/logger';
import { asyncHandler } from '@src/pages/content/utils/asyncHandler';

// dispatches custom mouse events to simulate a click event (used for buttons on gmail table)
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

// refreshes inbox table
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

// goes back to inbox from single mail view
export const goBackToInbox = () => {
  // query selector for the go back button
  const goBackToInboxBtnSelectors = [
    'div[title*="Back to"]',
    'div[data-tooltip*="Back to"]',
    'div[aria-label*="Back to"]',
  ];
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
