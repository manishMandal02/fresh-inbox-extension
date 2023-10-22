import { IMessageBody, IMessageEvent } from '../types/content.types';
import { hideLoadingSnackbar, showLoadingSnackbar, showSnackbar } from '../view/elements/snackbar';
import { updateFreshInboxSettingsBtn } from '../view/freshInboxSettingsBtn';
import { logger } from './logger';

// disable app
export const disableApp = async () => {
  // show loading snackbar
  showLoadingSnackbar({ title: 'Disabling Fresh Inbox...', email: '' });
  // disable app
  const res = await chrome.runtime.sendMessage<IMessageBody>({ event: IMessageEvent.DISABLE_FRESH_INBOX });

  //  remove assistant buttons (create a utility fn)
  const assistantButtons = document.getElementsByClassName('freshInbox-assistantBtn');

  if (assistantButtons.length < 1) return;

  for (const btn of assistantButtons) {
    // remove the button
    btn.remove();
  }
  // update setting btn state
  updateFreshInboxSettingsBtn({ isDisabled: true });

  hideLoadingSnackbar();
  if (res) {
    // show success snackbar
    showSnackbar({ title: 'Fresh Inbox has been disabled', email: '' });
    logger.dev('✅ Fresh Inbox has been disabled', 'authModal.ts:31 ~ handleDisableBtnClick()');
  } else {
    showSnackbar({ title: 'Failed to disable Fresh Inbox', isError: true, email: '' });

    logger.dev('❌ Failed to disable Fresh Inbox', 'authModal.ts:33 ~ handleDisableBtnClick()');
  }
};
