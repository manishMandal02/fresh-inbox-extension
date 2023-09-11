import { storageKeys } from '../constants/app.constants';
import { IMessageEvent } from '../content.types';

// get list of unsubscribed emails
export const getUnsubscribedEmails = async (): Promise<string[]> => {
  let unsubscribedEmails = [''];

  try {
    // check if unsubscribed emails already exist in storage
    const localStorageData = await chrome.storage.local.get(storageKeys.UNSUBSCRIBED_EMAILS);

    if (localStorageData[storageKeys.UNSUBSCRIBED_EMAILS]) {
      // if emails exist, return them
      unsubscribedEmails = localStorageData[storageKeys.UNSUBSCRIBED_EMAILS];
    } else {
      // if  not, get from background script

      // send message/event to background script to fetch emails
      const emails = await chrome.runtime.sendMessage({ event: IMessageEvent.GET_UNSUBSCRIBED_EMAILS });
      if (emails.length) {
        unsubscribedEmails = emails;
      }
    }

    return unsubscribedEmails;
  } catch (err) {
    console.log('🚀 ~ file: getEmailsFromStorage.ts:12 ~ getUnsubscribedEmails ~ err:', err);
  }
};

// get list of whitelisted emails
export const getWhitelistedEmails = async (): Promise<string[]> => {
  let whitelistedEmails = [''];

  try {
    // check if whitelisted emails already exist in storage
    const localStorageData = await chrome.storage.local.get(storageKeys.WHITELISTED_EMAILS);

    if (localStorageData[storageKeys.WHITELISTED_EMAILS]) {
      // if emails exist, return them
      whitelistedEmails = localStorageData[storageKeys.WHITELISTED_EMAILS];
    } else {
      // if  not, get from background script

      // send message/event to background script to fetch emails
      const emails = await chrome.runtime.sendMessage({ event: IMessageEvent.GET_WHITELISTED_EMAILS });
      if (emails) {
        whitelistedEmails = emails;
      }
    }

    return whitelistedEmails;
  } catch (err) {
    console.log('🚀 ~ file: getEmailsFromStorage.ts:41 ~ getWhitelistedEmails ~ err:', err);
  }
};
