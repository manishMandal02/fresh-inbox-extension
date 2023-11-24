import { IMessageBody, IMessageEvent } from '../types/content.types';
import { removeAssistantBtn } from '../view/assistant-button/helper/removeAssistantBtn';
import { hideLoadingSnackbar, showLoadingSnackbar, showSnackbar } from '../view/elements/snackbar';
import { logger } from './logger';
import { publishEvent } from './publishEvent';

// disable app
export const disableApp = async () => {
  // show loading snackbar
  showLoadingSnackbar({ title: 'Disabling Fresh Inbox...', emails: [] });
  // disable app
  const res = await publishEvent({ event: IMessageEvent.DISABLE_FRESH_INBOX });

  removeAssistantBtn();

  hideLoadingSnackbar();

  if (res) {
    // show success snackbar
    showSnackbar({ title: 'Fresh Inbox has been disabled', emails: [] });
    logger.dev('✅ Fresh Inbox has been disabled', 'authModal.ts:31 ~ handleDisableBtnClick()');
  } else {
    showSnackbar<true>({ title: 'Failed to disable Fresh Inbox', isError: true });

    logger.dev('❌ Failed to disable Fresh Inbox', 'authModal.ts:33 ~ handleDisableBtnClick()');
  }
};
