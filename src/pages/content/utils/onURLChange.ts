import type { AsyncCallback } from '../types/content.types';

// watch for url change
export const onURLChange = (callback: AsyncCallback) => {
  // location/url change event listener
  window.addEventListener('hashchange', async () => {
    // call the callback fn, on url change
    await callback();
  });

  // handle location/url change
  //   var pushState = history.pushState;
  //   history.pushState = function () {
  //     pushState.apply(history, arguments);
  //   };
};
