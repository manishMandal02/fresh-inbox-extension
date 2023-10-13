type Callback = () => Promise<void>;

// watch for url change
export const onURLChange = (callback: Callback) => {
  console.log('🚀 ~ file: onUrlChange.ts:17 ~ onURLChange ~ onURLChange:');

  // location/url change event listener
  window.addEventListener('hashchange', () => {
    // call the callback fn, on url change
    callback();
  });

  // handle location/url change
  //   var pushState = history.pushState;
  //   history.pushState = function () {
  //     pushState.apply(history, arguments);
  //   };
};
