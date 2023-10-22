import { IMessageEvent } from '../types/content.types';
import { logger } from './logger';

// get list of unsubscribed emails
export const getUnsubscribedEmails = async (): Promise<string[]> => {
  try {
    // send message/event to background script to fetch emails
    const emails = await chrome.runtime.sendMessage<IMessageBody>({
      event: IMessageEvent.GET_UNSUBSCRIBED_EMAILS,
    });
    if (emails) {
      return emails;
    } else {
      throw new Error('❌ Failed to get unsubscribed emails.');
    }
  } catch (error) {
    logger.error({
      error,
      msg: 'Failed to get unsubscribe emails',
      fileTrace: 'content/utils/getEmailsFromStorage.ts:19 ~ getUnsubscribedEmails()',
    });
    return [];
  }
};

// get list of whitelisted emails
export const getWhitelistedEmails = async (): Promise<string[]> => {
  try {
    // send message/event to background script to fetch emails
    const emails = await chrome.runtime.sendMessage<IMessageBody>({
      event: IMessageEvent.GET_WHITELISTED_EMAILS,
    });
    if (emails) {
      return emails;
    } else {
      throw new Error('❌ Failed to get whitelisted emails.');
    }
  } catch (error) {
    logger.error({
      error,
      msg: 'Failed to get whitelisted emails',
      fileTrace: 'content/utils/getEmailsFromStorage.ts:38 ~ getWhitelistedEmails()',
    });
    return [];
  }
};
