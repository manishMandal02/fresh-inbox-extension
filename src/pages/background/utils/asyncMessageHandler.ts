type Listener<T> = (request: T, sender: chrome.runtime.MessageSender) => Promise<string>;

const asyncMessageHandler =
  <T>(listener: Listener<T>) =>
  (request: T, sender: chrome.runtime.MessageSender, sendResponse) => {
    // the listener(...) might return a non-promise result (not an async function), so we wrap it with Promise.resolve()
    Promise.resolve(listener(request, sender)).then(sendResponse);
    return true; // return true to indicate you want to send a response asynchronously
  };

export { asyncMessageHandler };
