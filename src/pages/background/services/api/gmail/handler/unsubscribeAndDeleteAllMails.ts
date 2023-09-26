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
  await unsubscribeEmail({ token, email, isWhiteListed });

  //delete all mails
  await deleteAllMails({ token, email });
};
