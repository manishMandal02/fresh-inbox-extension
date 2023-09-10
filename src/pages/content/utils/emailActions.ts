import { IMessageBody, IMessageEvent } from '../content.types';
import { hideLoadingSnackbar, showLoadingSnackbar } from '../view/elements/snackbar';

//* handle unsubscribe
const handleUnsubscribe = async () => {
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
    });
    // hide snackbar
    hideLoadingSnackbar();
    return res;
  } catch (err) {
    hideLoadingSnackbar();
    console.log('🚀 ~ file: emailActions.ts: ~ handleUnsubscribe ~ err:', err);
  }
};

//* handle delete all mails
const handleDeleteAllMails = async () => {
  try {
    // get email and name from global variables
    const { email, name } = mailMagicGlobalVariables;
    // show loading snackbar

    showLoadingSnackbar({
      title: `Deleting all mails from`,
      email,
    });
    // send message/event to background script
    const res = await chrome.runtime.sendMessage({ event: IMessageEvent.Delete_All_Mails, email, name });
    // hide snackbar
    hideLoadingSnackbar();
    return res;
  } catch (err) {
    hideLoadingSnackbar();
    console.log('🚀 ~ file: emailActions.ts: ~ handleDeleteAllMails ~ err:', err);
  }
};

//* handle unsubscribe and delete all mails
const handleUnsubscribeAndDeleteAllMails = async () => {
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
    });

    // hide snackbar
    hideLoadingSnackbar();
    return res;
  } catch (err) {
    hideLoadingSnackbar();
    console.log('🚀 ~ file: emailActions.ts: ~ handleDeleteAllMails ~ err:', err);
  }
};

//*handle re-subscribe

const handleReSubscribe = async () => {
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
    return res;
  } catch (err) {
    hideLoadingSnackbar();
    console.log('🚀 ~ file: emailActions.ts: ~ handleDeleteAllMails ~ err:', err);
  }
};

//* handle whitelist
const handleWhitelist = async () => {
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
    return res;
  } catch (err) {
    hideLoadingSnackbar();
    console.log('🚀 ~ file: emailActions.ts: ~ handleWhitelist ~ err:', err);
  }
};

export {
  handleUnsubscribe,
  handleDeleteAllMails,
  handleUnsubscribeAndDeleteAllMails,
  handleReSubscribe,
  handleWhitelist,
};
