import { IMessageBody, IMessageEvent } from '../types/content.types';
import { showConfirmModal } from '../view/elements/confirmModal';
import { hideLoadingSnackbar, showLoadingSnackbar, showSnackbar } from '../view/elements/snackbar';
import { logger } from './logger';

// handle unsubscribe
const handleUnsubscribeEmail = async (emails: string[], isWhitelisted = false): Promise<boolean> => {
  try {
    // show loading snackbar
    showLoadingSnackbar({
      emails,
      title: `Unsubscribing from`,
    });
    // send message/event to background script
    const res = await chrome.runtime.sendMessage<IMessageBody>({
      emails,
      isWhitelisted,
      event: IMessageEvent.UNSUBSCRIBE,
    });
    if (!res) {
      throw new Error('Failed to unsubscribe');
    }
    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({
      emails,
      title: 'Successfully unsubscribed from',
    });

    return res;
  } catch (error) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar<true>({ title: 'Failed to unsubscribe from', isError: true });
    logger.error({
      error,
      msg: 'Failed to unsubscribe email',
      fileTrace: 'content/utils/emailActions.ts:37 ~ handleUnsubscribeEmail()',
    });
    return false;
  }
};

// handle delete all mails
const handleDeleteAllMails = async (emails: string[]): Promise<boolean> => {
  try {
    // show loading snackbar
    showLoadingSnackbar({
      emails,
      title: `Deleting all mails from`,
    });
    // send message/event to background script
    const res = await chrome.runtime.sendMessage<IMessageBody>({
      event: IMessageEvent.DELETE_ALL_MAILS,
      emails,
    });
    if (!res) {
      throw new Error('Failed to delete mails');
    }
    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully deleted all mails from', emails });

    return res;
  } catch (error) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar<true>({ title: 'Failed to delete all mails from', isError: true });
    logger.error({
      error,
      msg: 'Failed to delete all mails',
      fileTrace: 'content/utils/emailActions.ts:72 ~ handleDeleteAllMails()',
    });
    return false;
  }
};

type HandleUnSubscribeAndDeleteAllMailsParams = {
  emails: string[];
  isWhitelisted?: boolean;
};

// handle unsubscribe and delete all mails
const handleUnsubscribeAndDeleteAllMails = async ({
  emails,
  isWhitelisted,
}: HandleUnSubscribeAndDeleteAllMailsParams): Promise<boolean> => {
  try {
    // show loading snackbar
    showLoadingSnackbar({
      emails,
      title: `Unsubscribing and deleting all mails from`,
    });

    // send message/event to background script
    const res = await chrome.runtime.sendMessage<IMessageBody>({
      event: IMessageEvent.UNSUBSCRIBE_AND_DELETE_MAILS,
      emails,
      isWhitelisted,
    });

    if (!res) {
      throw new Error('Failed to unsubscribe & delete mails');
    }

    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully unsubscribed & deleted all mails from', emails });
    return res;
  } catch (error) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar<true>({ title: 'Failed to unsubscribed & delete all mails from', isError: true });
    logger.error({
      error,
      msg: 'Failed to unsubscribed & delete mails',
      fileTrace: 'content/utils/emailActions.ts:118 ~ handleUnsubscribeAndDeleteAllMails()',
    });
    return false;
  }
};

// handle re-subscribe
const handleReSubscribeEmail = async (emails: string[]): Promise<boolean> => {
  try {
    // show loading snackbar
    showLoadingSnackbar({
      emails,
      title: `Re-subscribing to `,
    });

    // send message/event to background script
    const res = await chrome.runtime.sendMessage<IMessageBody>({ event: IMessageEvent.RE_SUBSCRIBE, emails });

    if (!res) {
      throw new Error('Failed to resubscribe');
    }
    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully reSubscribed to', emails });

    return res;
  } catch (error) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar<true>({ title: 'Failed to reSubscribe', isError: true });

    logger.error({
      error,
      msg: 'Failed to reSubscribe',
      fileTrace: 'content/utils/emailActions.ts:153 ~ handleReSubscribeEmail()',
    });
    return false;
  }
};

// handle whitelist
const handleWhitelistEmail = async (emails: string[]): Promise<boolean> => {
  try {
    // show loading snackbar
    showLoadingSnackbar({
      emails,
      title: `Whitelisting `,
    });

    // send message/event to background script
    const res = await chrome.runtime.sendMessage<IMessageBody>({
      emails,
      event: IMessageEvent.WHITELIST_EMAIL,
    });
    if (!res) {
      throw new Error('Failed to whitelist email');
    }
    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully whitelisted', emails });
    return res;
  } catch (error) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar<true>({ title: 'Failed to whitelist ', isError: true });
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
  emails: string[];
  name?: string;
  onSuccess?: () => Promise<void>;
  isWhitelisted?: boolean;
}

// export handle whitelist action handler
export const handleWhitelistAction = async ({ emails }: IEmailActionParams): Promise<boolean> => {
  const isSuccess = await handleWhitelistEmail(emails);
  return isSuccess;
};

// export handle unsubscribe action handler
export const handleUnsubscribeAction = async ({
  emails,
  isWhitelisted,
}: IEmailActionParams): Promise<boolean> => {
  const isSuccess = await handleUnsubscribeEmail(emails, isWhitelisted);
  return isSuccess;
};

// export delete-all-mails-action handler
export const handleDeleteAllMailsAction = async ({ emails, onSuccess }: IEmailActionParams) => {
  await showConfirmModal({
    email: emails.length > 1 ? `${emails.length} emails` : emails[0],
    msg: 'Are you sure you want to delete all mails from',
    onConfirmClick: async () => {
      const isSuccess = await handleDeleteAllMails(emails);
      // call onSuccess callback fn
      if (isSuccess) {
        await onSuccess();
      }
    },
  });
};

// export unsubscribe--and--delete--all--mails action handler
export const handleUnsubscribeAndDeleteAction = async ({
  emails,
  onSuccess,
  isWhitelisted,
}: IEmailActionParams) => {
  await showConfirmModal({
    email: emails.length > 1 ? `${emails.length} emails` : emails[0],
    msg: 'Are you sure you want to delete all mails and unsubscribe from',
    onConfirmClick: async () => {
      const isSuccess = await handleUnsubscribeAndDeleteAllMails({
        emails,

        isWhitelisted,
      });
      // call onSuccess callback fn
      await onSuccess();
    },
  });
};

export const handleReSubscribeAction = async ({ emails }: IEmailActionParams): Promise<boolean> => {
  // handle whitelist action
  const isSuccess = await handleReSubscribeEmail(emails);
  return isSuccess;
};
