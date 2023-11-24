// publish events to  background script

import type { IMessageBody } from '../types/content.types';
import { logger } from './logger';

export const publishEvent = async <T = boolean>(msg: Omit<IMessageBody, 'userEmail'>): Promise<T> => {
  try {
    // get user email from global variables
    const userEmail = freshInboxGlobalVariables.userEmail;
    // publish event
    return await chrome.runtime.sendMessage<IMessageBody>({ ...msg, userEmail });
  } catch (error) {
    logger.error({
      error,
      msg: 'Error publishing event to background script',
      fileTrace: 'content/utils/publishEvent.ts:13 ~ publishEvent() ~ catch block',
    });
    return null;
  }
};
