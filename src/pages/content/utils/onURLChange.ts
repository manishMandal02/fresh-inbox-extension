type Callback = () => Promise<void>;

// watch for url change
export const onURLChange = (callback: Callback) => {
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
