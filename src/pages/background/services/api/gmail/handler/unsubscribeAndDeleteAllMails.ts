import { APIHandleParams } from '@src/pages/background/types/background.types';
import { unsubscribeEmail } from './unsubscribeEmail';
import { deleteAllMails } from './deleteAllMails';

export const unsubscribeAndDeleteAllMails = async ({ email, token }: APIHandleParams) => {
  // unsubscribe
  await unsubscribeEmail({ token, email });

  //delete all mails
  await deleteAllMails({ token, email });
};
