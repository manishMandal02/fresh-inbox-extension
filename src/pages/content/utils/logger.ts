type LoggerParams = {
  msg: string;
  error: unknown;
  fileTrace?: string;
};

export const logger = {
  /**
   * Global INFO logger for content script
   * @param msg log message
   * @param fileTrace file trace of the log
   */
  dev: (msg: string, fileTrace: string) => {
    // no logging if running in prod
    if (freshInboxGlobalVariables.loggerLevel === 'prod') return;
    console.log(`FreshInbox:LOGGER:DEV 🛜 ~ ${msg}  \n  ${fileTrace ? `📁 File: ${fileTrace}` : ''}`);
  },

  /**
   * Global INFO logger for content script
   * @param msg log message
   * @param fileTrace file trace of the log
   */
  info: (msg: string, _fileTrace: string) => {
    console.log(`FreshInbox:LOGGER:INFO ℹ️ ~ ${msg}`);
  },

  /**
   * Global INFO logger for content script
   * @param msg log message
   * @param fileTrace file trace of the log
   * @param error error object
   */
  error: ({ msg, fileTrace, error }: LoggerParams) => {
    console.log(
      `FreshInbox:LOGGER:ERROR ❌ ~ ${msg}  \n  ${fileTrace ? `📁 File: ${fileTrace}` : ''}`,
      error
    );
  },
};
