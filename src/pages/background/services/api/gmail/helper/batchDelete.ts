import { logger } from '@src/pages/background/utils/logger';

// delete all mails in batches for faster processing
export const batchDeleteMails = async (token: string, ids: string[]) => {
  // added TRASH label, remove INBOX label for all the emails/messages
  const reqBody = {
    ids,
    addLabelIds: ['TRASH'],
    removeLabelIds: ['INBOX'],
  };

  const fetchOptions: Partial<RequestInit> = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reqBody),
  };

  try {
    // batch delete emails
    await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify', fetchOptions);
    return true;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error while batch deleting emails',
      fileTrace: 'background/services/api/gmail/handler/deeAllMails.ts:30 batchDeleteMails() catch block',
    });
    return false;
  }
};
