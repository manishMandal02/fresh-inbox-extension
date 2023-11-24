import type { APIHandleParams } from '@src/pages/background/types/background.types';
import { unsubscribeEmail } from './unsubscribeEmail';
import { deleteAllMails } from './deleteAllMails';

type UnsubscribeAndDeleteAllMailsParams = {
  isWhitelisted: boolean;
} & APIHandleParams;

export const unsubscribeAndDeleteAllMails = async ({
  emails,
  userToken,
  isWhitelisted,
}: UnsubscribeAndDeleteAllMailsParams) => {
  // unsubscribe
  const res1 = await unsubscribeEmail({ userToken, emails, isWhitelisted });

  //delete all mails
  const res2 = await deleteAllMails({ userToken, emails });

  if (res1 && res2) {
    return true;
  } else {
    return false;
  }
};
