import { IMessageBody, IMessageEvent } from '../content.types';
import { hideLoadingSnackbar, showLoadingSnackbar, showSnackbar } from '../view/elements/snackbar';

//* handle unsubscribe
export const handleUnsubscribe = async (isWhiteListed = false) => {
  try {
    // get email and name from global variables
    const { email, name } = mailMagicGlobalVariables;
    // show loading snackbar
    showLoadingSnackbar({
      title: `Unsubscribing from`,
      email,
    });
    // send message/event to background script
    const res = await chrome.runtime.sendMessage<IMessageBody>({
      event: IMessageEvent.Unsubscribe,
      email,
      name,
      isWhiteListed: isWhiteListed,
    });
    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully unsubscribed from', email });

    return res;
  } catch (err) {
    hideLoadingSnackbar();
    console.log('🚀 ~ file: emailActions.ts: ~ handleUnsubscribe ~ err:', err);
    // show error snackbar
    showSnackbar({ title: 'Failed to unsubscribe from', email: '', isError: true });
    return false;
  }
};

//* handle delete all mails
export const handleDeleteAllMails = async (shouldRefreshTable = false) => {
  try {
    // get email and name from global variables
    const { email, name } = mailMagicGlobalVariables;
    // show loading snackbar

    showLoadingSnackbar({
      title: `Deleting all mails from`,
      email,
    });
    // send message/event to background script
    const res = await chrome.runtime.sendMessage({
      event: IMessageEvent.Delete_All_Mails,
      email,
      name,
      shouldRefreshTable,
    });
    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully deleted all mails from', email });
    return res;
  } catch (err) {
    hideLoadingSnackbar();
    console.log('🚀 ~ file: emailActions.ts: ~ handleDeleteAllMails ~ err:', err);
    // show error snackbar
    showSnackbar({ title: 'Failed to delete all mails from', email: '', isError: true });
    return false;
  }
};

type HandleUnSubscribeAndDeleteAllMailsParams = {
  isWHitelisted?: boolean;
  shouldRefreshTable?: boolean;
};

//* handle unsubscribe and delete all mails
export const handleUnsubscribeAndDeleteAllMails = async ({
  shouldRefreshTable,
  isWHitelisted,
}: HandleUnSubscribeAndDeleteAllMailsParams) => {
  try {
    // get email and name from global variables
    const { email, name } = mailMagicGlobalVariables;

    // show loading snackbar
    showLoadingSnackbar({
      title: `Unsubscribing and deleting all mails from`,
      email,
    });

    // send message/event to background script
    const res = await chrome.runtime.sendMessage({
      event: IMessageEvent.Unsubscribe_And_Delete_All_Mails,
      email,
      name,
      shouldRefreshTable,
      isWHitelisted,
    });

    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully unsubscribed & deleted all mails from', email });
    return res;
  } catch (err) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar({ title: 'Failed to unsubscribed & delete all mails from', email: '', isError: true });
    console.log('🚀 ~ file: emailActions.ts: ~ handleDeleteAllMails ~ err:', err);
    return false;
  }
};

//*handle re-subscribe

export const handleReSubscribe = async () => {
  try {
    // get email and name from global variables
    const { email, name } = mailMagicGlobalVariables;
    // show loading snackbar
    showLoadingSnackbar({
      title: `Re-subscribing to `,
      email,
    });

    // send message/event to background script
    const res = await chrome.runtime.sendMessage({ event: IMessageEvent.RE_SUBSCRIBE, email, name });

    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully reSubscribed to', email });
    return res;
  } catch (err) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar({ title: 'Failed to reSubscribe', email: '', isError: true });

    console.log('🚀 ~ file: emailActions.ts: ~ handleDeleteAllMails ~ err:', err);
    return false;
  }
};

//* handle whitelist
export const handleWhitelist = async () => {
  try {
    // get email and name from global variables
    const { email, name } = mailMagicGlobalVariables;
    // show loading snackbar
    showLoadingSnackbar({
      title: `Whitelisting `,
      email,
    });

    // send message/event to background script
    const res = await chrome.runtime.sendMessage({ event: IMessageEvent.WHITELIST_EMAIL, email, name });

    // hide snackbar
    hideLoadingSnackbar();
    // show success snackbar
    showSnackbar({ title: 'Successfully whitelisted', email });
    return res;
  } catch (err) {
    hideLoadingSnackbar();
    // show error snackbar
    showSnackbar({ title: 'Failed to whitelist ', email: '', isError: true });
    console.log('🚀 ~ file: emailActions.ts: ~ handleWhitelist ~ err:', err);
    return false;
  }
};
