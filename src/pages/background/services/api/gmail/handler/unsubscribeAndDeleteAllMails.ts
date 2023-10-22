import type { APIHandleParams } from '@src/pages/background/types/background.types';
import { unsubscribeEmail } from './unsubscribeEmail';
import { deleteAllMails } from './deleteAllMails';

type UnsubscribeAndDeleteAllMailsParams = {
  isWhitelisted: boolean;
} & APIHandleParams;

export const unsubscribeAndDeleteAllMails = async ({
  emails,
  token,
  isWhitelisted,
}: UnsubscribeAndDeleteAllMailsParams) => {
  // unsubscribe
  const res1 = await unsubscribeEmail({ token, emails, isWhitelisted });

  //delete all mails
  const res2 = await deleteAllMails({ token, emails });

  if (res1 && res2) {
    return true;
  } else {
    return false;
  }
};
