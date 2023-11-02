import { IMessageBody, IMessageEvent } from '../types/content.types';
import { hideLoadingSnackbar, showLoadingSnackbar, showSnackbar } from '../view/elements/snackbar';
import { logger } from './logger';

// disable app
export const disableApp = async () => {
  // show loading snackbar
  showLoadingSnackbar({ title: 'Disabling Fresh Inbox...', emails: [] });
  // disable app
  const res = await chrome.runtime.sendMessage<IMessageBody>({ event: IMessageEvent.DISABLE_FRESH_INBOX });

  //  remove assistant buttons, if any
  const assistantButtons = document.getElementsByClassName('freshInbox-assistantBtn');

  if (assistantButtons.length < 1) return;

  for (const btn of assistantButtons) {
    // remove the button
    btn.remove();
  }

  hideLoadingSnackbar();

  if (res) {
    // show success snackbar
    showSnackbar({ title: 'Fresh Inbox has been disabled', emails: [] });
    logger.dev('✅ Fresh Inbox has been disabled', 'authModal.ts:31 ~ handleDisableBtnClick()');
  } else {
    showSnackbar<true>({ title: 'Failed to disable Fresh Inbox', isError: true });

    logger.dev('❌ Failed to disable Fresh Inbox', 'authModal.ts:33 ~ handleDisableBtnClick()'); }
};
