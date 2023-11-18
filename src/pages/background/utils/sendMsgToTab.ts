// send message/events to active tab (content script)

import type { IMessageBody } from '../types/background.types';
import { logger } from './logger';

export const sendMsgToTab = async (msg: IMessageBody) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

    console.log('🚀 ~ file: sendMsgToTab.ts:10 ~ sendMsgToTab ~ tab:', tab);

    if (tab?.id) {
      const res = await chrome.tabs.sendMessage(tab.id, msg);

      if (!res) throw new Error('Failed to send message to tab');

      return res;
    } else {
      throw new Error('Failed to get current tab id');
    }
  } catch (error) {
    logger.error({
      error,
      msg: 'Error sending message to tab',
      fileTrace: 'background/utils/sendMsgToTab.ts:22 ~ sendMsgToTab() ~ catch block',
    });
    return false;
  }
};
