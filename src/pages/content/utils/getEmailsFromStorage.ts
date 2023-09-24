import { IMessageEvent } from '../content.types';

// get list of unsubscribed emails
export const getUnsubscribedEmails = async (): Promise<string[]> => {
  try {
    // send message/event to background script to fetch emails
    const emails = await chrome.runtime.sendMessage({ event: IMessageEvent.GET_UNSUBSCRIBED_EMAILS });
    if (emails) {
      return emails;
    } else {
      throw new Error('❌ Failed to get unsubscribed emails.');
    }
  } catch (err) {
    console.log('🚀 ~ file: getEmailsFromStorage.ts:12 ~ getUnsubscribedEmails ~ err:', err);
    return [];
  }
};

// get list of whitelisted emails
export const getWhitelistedEmails = async (): Promise<string[]> => {
  try {
    // send message/event to background script to fetch emails
    const emails = await chrome.runtime.sendMessage({ event: IMessageEvent.GET_WHITELISTED_EMAILS });
    if (emails) {
      return emails;
    } else {
      throw new Error('❌ Failed to get whitelisted emails.');
    }
  } catch (err) {
    console.log('🚀 ~ file: getEmailsFromStorage.ts:41 ~ getWhitelistedEmails ~ err:', err);
    return [];
  }
};
