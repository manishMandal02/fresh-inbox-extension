import { APIHandleParams } from '@src/pages/background/types/background.types';
import { unsubscribeEmail } from './unsubscribeEmail';
import { deleteAllMails } from './deleteAllMails';

type UnsubscribeAndDeleteAllMailsParams = {
  isWhiteListed: boolean;
} & APIHandleParams;

export const unsubscribeAndDeleteAllMails = async ({
  email,
  token,
  isWhiteListed,
}: UnsubscribeAndDeleteAllMailsParams) => {
  // unsubscribe
  const res1 = await unsubscribeEmail({ token, email, isWhiteListed });

  //delete all mails
  const res2 = await deleteAllMails({ token, email });

  if (res1 && res2) {
    return true;
  } else {
    return false;
  }
};
