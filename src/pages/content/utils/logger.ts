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
  dev: ({ msg, fileTrace }: Pick<LoggerParams, 'msg' | 'fileTrace'>) => {
    // no logging if running in prod
    if (mailMagicGlobalVariables.loggerLevel === 'prod') return;
    console.log(`MailMagic:LOGGER:DEV 🛜 ~ ${msg}  \n  ${fileTrace ? `📁 File: ${fileTrace}` : ''}`);
  },

  /**
   * Global INFO logger for content script
   * @param msg log message
   * @param fileTrace file trace of the log
   */
  info: ({ msg, fileTrace }: Pick<LoggerParams, 'msg' | 'fileTrace'>) => {
    console.log(`MailMagic:LOGGER:INFO ℹ️ ~ ${msg}  \n  ${fileTrace ? `📁 File: ${fileTrace}` : ''}`);
  },

  /**
   * Global INFO logger for content script
   * @param msg log message
   * @param fileTrace file trace of the log
   * @param error error object
   */
  error: ({ msg, fileTrace, error }: LoggerParams) => {
    console.log(`MailMagic:LOGGER:ERROR ❌ ~ ${msg}  \n  ${fileTrace ? `📁 File: ${fileTrace}` : ''}`, error);
  },
};
