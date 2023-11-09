type LoggerParams = {
  msg: string;
  error: any;
  fileTrace?: string;
};

const getCurrentTabId = async () => {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
};

export const logger = {
  /**
   * Global INFO logger for background script
   * @param msg log message
   * @param fileTrace file trace of the log
   */
  info: (msg: string, _fileTrace?: string) => {
    console.log(`FreshInbox:LOGGER:INFO ℹ️ ~ ${msg}`);
    // console.log(`FreshInbox:LOGGER:INFO ℹ️ ~ ${msg}  \n  ${fileTrace ? `📁 File: ${fileTrace}` : ''}`);
  },

  /**
   * Global INFO logger for background script
   * @param msg log message
   * @param fileTrace file trace of the log
   * @param error error object
   */
  error: ({ msg, fileTrace, error }: LoggerParams) => {
    console.log(
      `FreshInbox:LOGGER:ERROR ❌ ~ ${msg}  \n  ${fileTrace ? `📁 File: ${fileTrace}` : ''} \n`,
      error
    );

    // handle gmail api error
    if (error && error.code && error.code === 401) {
      //TODO - invalid credentials
      //
      //  const response = await chrome.tabs.sendMessage(tab.id, message);
    }

    if (error && error.code && error.code === 403) {
      //TODO - api limit exceeded
    }
  },
};
