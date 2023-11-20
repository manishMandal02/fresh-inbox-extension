import { clearUserData } from '..';
import { IMessageEvent } from '../types/background.types';
import { errorMessage } from './apiErrorHandler';
import { sendMsgToTab } from './sendMsgToTab';

type LoggerParams = {
  msg: string;
  error: any;
  fileTrace?: string;
};

export const logger = {
  /**
   * Global INFO logger for background script
   * @param msg log message
   * @param fileTrace file trace of the log
   */
  info: (msg: string, _fileTrace?: string) => {
    // log error
    console.log(`FreshInbox:LOGGER:INFO ℹ️ ~ ${msg}`);
    // console.log(`FreshInbox:LOGGER:INFO ℹ️ ~ ${msg}  \n  ${fileTrace ? `📁 File: ${fileTrace}` : ''}`);
  },

  /**
   * Global INFO error for background script
   * @param msg log message
   * @param fileTrace file trace of the log
   * @param error error object
   */
  error: ({ msg, fileTrace, error }: LoggerParams) => {
    // log error
    console.log(
      `FreshInbox:LOGGER:ERROR ❌ ~ ${msg}  \n  ${fileTrace ? `📁 File: ${fileTrace}` : ''} \n`,
      error
    );

    // handle global errors
    switch (error.message) {
      case errorMessage.unauthorized:
        (async () => {
          await sendMsgToTab({ event: IMessageEvent.LOGOUT_USER });
          await clearUserData(false);
        })();
        break;
      case errorMessage.apiLimitExceed:
        (async () => {
          await sendMsgToTab({ event: IMessageEvent.API_LIMIT_REACHED });
        })();
        break;
      case errorMessage.somethingWentWrong:
        (async () => {
          await sendMsgToTab({ event: IMessageEvent.BACKGROUND_ERROR });
        })();
        break;
      default:
        break;
    }
  },
};
