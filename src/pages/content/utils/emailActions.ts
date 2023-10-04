import { IMessageBody, IMessageEvent } from '../content.types';
import { showConfirmModal } from '../view/elements/confirmModal';
import { hideLoadingSnackbar, showLoadingSnackbar, showSnackbar } from '../view/elements/snackbar';
import { logger } from './logger';
import { renderLoadingSpinnerInsteadOfButtons } from './renderLoadingSpinnerInsteadOfButtons';

// handle unsubscribe
const handleUnsubscribeEmail = async (email: string, isWhiteListed = false): Promise<boolean> => {
  try {
    // show loading snackbar
    showLoadingSnackbar({
      title: `Unsubscribing from`,
      email,
    });
    // send message/event to background script
    const res = await chrome.runtime.sendMessage<IMessageBody>({
      email,
      isWhiteListed,
      event: IMessageEvent.Unsubscribe,
    });
    if (!res) {
      throw new Error('Failed to unsubscribe');
    }
    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully unsubscribed from', email });

    return res;
  } catch (error) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar({ title: 'Failed to unsubscribe from', email: '', isError: true });
    logger.error({
      error,
      msg: 'Failed to unsubscribe email',
      fileTrace: 'content/utils/emailActions.ts:37 ~ handleUnsubscribeEmail()',
    });
    return false;
  }
};

// handle delete all mails
const handleDeleteAllMails = async (email: string): Promise<boolean> => {
  try {
    // show loading snackbar
    showLoadingSnackbar({
      title: `Deleting all mails from`,
      email,
    });
    // send message/event to background script
    const res = await chrome.runtime.sendMessage({
      event: IMessageEvent.Delete_All_Mails,
      email,
    });
    if (!res) {
      throw new Error('Failed to delete mails');
    }
    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully deleted all mails from', email });

    return res;
  } catch (error) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar({ title: 'Failed to delete all mails from', email: '', isError: true });
    logger.error({
      error,
      msg: 'Failed to delete all mails',
      fileTrace: 'content/utils/emailActions.ts:72 ~ handleDeleteAllMails()',
    });
    return false;
  }
};

type HandleUnSubscribeAndDeleteAllMailsParams = {
  email: string;
  isWhitelisted?: boolean;
};

// handle unsubscribe and delete all mails
const handleUnsubscribeAndDeleteAllMails = async ({
  email,
  isWhitelisted,
}: HandleUnSubscribeAndDeleteAllMailsParams): Promise<boolean> => {
  try {
    // show loading snackbar
    showLoadingSnackbar({
      title: `Unsubscribing and deleting all mails from`,
      email,
    });

    // send message/event to background script
    const res = await chrome.runtime.sendMessage({
      event: IMessageEvent.Unsubscribe_And_Delete_All_Mails,
      email,
      isWhitelisted,
    });

    if (!res) {
      throw new Error('Failed to unsubscribe & delete mails');
    }

    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully unsubscribed & deleted all mails from', email });
    return res;
  } catch (error) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar({ title: 'Failed to unsubscribed & delete all mails from', email: '', isError: true });
    logger.error({
      error,
      msg: 'Failed to unsubscribed & delete mails',
      fileTrace: 'content/utils/emailActions.ts:118 ~ handleUnsubscribeAndDeleteAllMails()',
    });
    return false;
  }
};

// handle re-subscribe
const handleReSubscribeEmail = async (email: string): Promise<boolean> => {
  try {
    // show loading snackbar
    showLoadingSnackbar({
      title: `Re-subscribing to `,
      email,
    });

    // send message/event to background script
    const res = await chrome.runtime.sendMessage({ event: IMessageEvent.RE_SUBSCRIBE, email });

    if (!res) {
      throw new Error('Failed to resubscribe');
    }
    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully reSubscribed to', email });

    return res;
  } catch (error) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar({ title: 'Failed to reSubscribe', email: '', isError: true });

    logger.error({
      error,
      msg: 'Failed to reSubscribe',
      fileTrace: 'content/utils/emailActions.ts:153 ~ handleReSubscribeEmail()',
    });
    return false;
  }
};

// handle whitelist
const handleWhitelistEmail = async (email: string): Promise<boolean> => {
  try {
    // show loading snackbar
    showLoadingSnackbar({
      title: `Whitelisting `,
      email,
    });

    // send message/event to background script
    const res = await chrome.runtime.sendMessage({ event: IMessageEvent.WHITELIST_EMAIL, email });
    if (!res) {
      throw new Error('Failed to whitelist email');
    }
    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully whitelisted', email });
    return res;
  } catch (error) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar({ title: 'Failed to whitelist ', email: '', isError: true });
    logger.error({
      error,
      msg: 'Failed to whitelist',
      fileTrace: 'content/utils/emailActions.ts:185 ~ handleWhitelistEmail()',
    });
    return false;
  }
};

//*** export email actions handler
interface IEmailActionParams {
  email: string;
  name?: string;
  btnContainerId?: string;
  onSuccess?: () => Promise<void>;
  isWhitelisted?: boolean;
}

// export handle whitelist action handler
export const handleWhitelistAction = async ({
  email,
  btnContainerId,
}: IEmailActionParams): Promise<boolean> => {
  // render loading spinner if btnContainerId is provided
  if (btnContainerId) {
    const hideLoadingSpinner = renderLoadingSpinnerInsteadOfButtons(btnContainerId);
    const isSuccess = await handleWhitelistEmail(email);

    hideLoadingSpinner(!isSuccess);
    return isSuccess;
  } else {
    const isSuccess = await handleWhitelistEmail(email);
    return isSuccess;
  }
};

// export handle unsubscribe action handler
export const handleUnsubscribeAction = async ({
  email,
  btnContainerId,
  isWhitelisted,
}: IEmailActionParams): Promise<boolean> => {
  // render loading spinner if btnContainerId is provided
  if (btnContainerId) {
    const hideLoadingSpinner = renderLoadingSpinnerInsteadOfButtons(btnContainerId);

    const isSuccess = await handleUnsubscribeEmail(email, isWhitelisted);

    hideLoadingSpinner(!isSuccess);

    return isSuccess;
  } else {
    const isSuccess = await handleUnsubscribeEmail(email, isWhitelisted);

    return isSuccess;
  }
};

// export delete-all-mails-action handler
export const handleDeleteAllMailsAction = async ({
  email,
  btnContainerId,
  onSuccess,
}: IEmailActionParams) => {
  // render loading spinner if btnContainerId is provided

  if (btnContainerId) {
    showConfirmModal({
      email,
      msg: 'Are you sure you want to delete all mails from',
      onConfirmClick: async () => {
        const hideLoadingSpinner = renderLoadingSpinnerInsteadOfButtons(btnContainerId);
        const isSuccess = await handleDeleteAllMails(email);
        hideLoadingSpinner(!isSuccess);
        // call onSuccess callback fn
        await onSuccess();
      },
    });
  } else {
    showConfirmModal({
      email,
      msg: 'Are you sure you want to delete all mails from',
      onConfirmClick: async () => {
        const isSuccess = await handleDeleteAllMails(email);
        // call onSuccess callback fn
        if (isSuccess) {
          await onSuccess();
        }
      },
    });
  }
};

// export unsubscribe--and--delete--all--mails action handler
export const handleUnsubscribeAndDeleteAction = async ({
  email,
  btnContainerId,
  onSuccess,
  isWhitelisted,
}: IEmailActionParams) => {
  // render loading spinner if btnContainerId is provided
  if (btnContainerId) {
    showConfirmModal({
      email,
      msg: 'Are you sure you want to delete all mails and unsubscribe from',
      onConfirmClick: async () => {
        const hideLoadingSpinner = renderLoadingSpinnerInsteadOfButtons(btnContainerId);
        const isSuccess = await handleUnsubscribeAndDeleteAllMails({
          email,

          isWhitelisted,
        });
        hideLoadingSpinner(!isSuccess);
        // call onSuccess callback fn
        await onSuccess();
      },
    });
  } else {
    showConfirmModal({
      email,
      msg: 'Are you sure you want to delete all mails and unsubscribe from',
      onConfirmClick: async () => {
        const isSuccess = await handleUnsubscribeAndDeleteAllMails({
          email,
          isWhitelisted,
        });
        // call onSuccess callback fn
        if (isSuccess) {
          await onSuccess();
        }
      },
    });
  }
};

export const handleReSubscribeAction = async ({
  email,
  btnContainerId,
}: IEmailActionParams): Promise<boolean> => {
  // render loading spinner if btnContainerId is provided
  if (btnContainerId) {
    // show loading spinner
    const hideLoadingSpinner = renderLoadingSpinnerInsteadOfButtons(btnContainerId);

    // handle whitelist action
    const isSuccess = await handleReSubscribeEmail(email);

    hideLoadingSpinner(!isSuccess);
    return isSuccess;
  } else {
    // handle whitelist action
    const isSuccess = await handleReSubscribeEmail(email);
    return isSuccess;
  }
};
