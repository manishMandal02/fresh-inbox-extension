import { logger } from '@src/pages/content/utils/logger';
import { batchDeleteMails } from '../../helper/batchDelete';
import wait from '@src/pages/content/utils/wait';

// gmail api limit: max 1000 ids can be sent per req
const BATCH_SIZE = 1000;

export const bulkDelete = async (token: string, ids: string[]) => {
  const batches: string[][] = [];

  // create batches of emails
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    // if last batch is not more than half of batch size then add to previous batch
    batches.push(ids.slice(i, i + BATCH_SIZE));
  }
  try {
    // process batches
    for (const batch of batches) {
      console.log('🚀 ~ file: bulkDelete.ts:19 ~ bulkDelete ~ batch:', batch.length);

      const res = await batchDeleteMails(token, batch);
      if (!res) throw new Error('❌ Failed to delete emails');
    }
    await wait(10000);
    return true;
  } catch (error) {
    logger.error({
      error,
      msg: '❌ Error while bulk deleting emails',
      fileTrace:
        'background/services/api/gmail/handler/advance-search/bulkDelete.ts:28 bulkDelete() catch block',
    });
    return false;
  }
};
