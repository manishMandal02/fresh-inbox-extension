//* the refresh button doesn't have a consistent selector to target it

import { logger } from './logger';

export const refreshEmailsTable = () => {
  const refreshBtnSelectors = ['div[title="Refresh"]', '[aria-label="Refresh"]', '[data-tooltip="Refresh"]'];
  return new Promise<string>((resolve, reject) => {
    let refreshBtn: HTMLDivElement | null = null;
    // loop through selectors to find refresh button
    for (const selector of refreshBtnSelectors) {
      if (document.querySelector(selector)) {
        refreshBtn = document.querySelector(selector) as HTMLDivElement;
        break;
      }
    }

    if (!refreshBtn) {
      logger.error({
        error: new Error('❌ refresh button not found'),
        msg: 'Refresh button not found',
        fileTrace: 'content/utils/refreshEmailsTable.ts:19 ~ refreshEmailsTable()',
      });
      reject(' refresh button not found');
    }
    //* simulate a click event on refresh table button

    // Simulate a mousedown event
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    refreshBtn.dispatchEvent(mousedownEvent);

    // Simulate a mouseup event
    const mouseupEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    refreshBtn.dispatchEvent(mouseupEvent);

    // Simulate a mouseup event
    const mouseoutEvent = new MouseEvent('mouseout', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    refreshBtn.dispatchEvent(mouseoutEvent);

    resolve('success');
  });
};
