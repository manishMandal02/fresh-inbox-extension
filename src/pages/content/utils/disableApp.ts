import { IMessageEvent } from '../types/content.types';

// disable fresh inbox
export const disableApp = async () => {
  //TODO: disable Fresh Inbox
  await chrome.runtime.sendMessage({ event: IMessageEvent.DISABLE_FRESH_INBOX });

  // TODO: remove assistant buttons (create a utility fn)
  const assistantButtons = document.getElementsByClassName('freshInbox-assistantBtn');

  if (assistantButtons.length < 1) return;

  for (const btn of assistantButtons) {
    // remove the button
    btn.remove();
  }

  // TODO: update settings button color/icon
};
