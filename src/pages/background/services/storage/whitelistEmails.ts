import { storageKeys } from '../../constants/app.constants';

type whitelistEmailsParams = {
  token: string;
  email: string;
};

export const whitelistEmails = async ({ token, email }: whitelistEmailsParams) => {
  try {
    // get whitelisted emails from storage
    const syncStorageData = await chrome.storage.sync.get(storageKeys.WHITELISTED_EMAILS);

    // new list of whitelisted email
    const newWhitelistedEmails = [email];

    // check if storage has emails or not
    if (
      syncStorageData[storageKeys.WHITELISTED_EMAILS] &&
      syncStorageData[storageKeys.WHITELISTED_EMAILS].length > 0
    ) {
      // added previous whitelisted emails to the new list
      newWhitelistedEmails.push(syncStorageData[storageKeys.WHITELISTED_EMAILS]);
    }

    // save the new list to the
    await chrome.storage.sync.set({ [storageKeys.WHITELISTED_EMAILS]: newWhitelistedEmails });
    console.log('✅ Successfully saved email to whitelisting list');
  } catch (err) {
    console.log(
      '🚀 ~ file: whitelistEmails.ts:13 ~ whitelistEmails: ❌ Failed to add email to whitelisting list  ~ err:',
      err
    );
  }
};
