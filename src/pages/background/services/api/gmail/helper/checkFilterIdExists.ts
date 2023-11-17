import { logger } from '@src/pages/background/utils/logger';
import { getFilterById } from './gmailFilters';

// check if filter id exists of not
export const checkFilterIdExists = async (token: string, filterId: string): Promise<boolean> => {
  try {
    const filter = await getFilterById(token, filterId);

    console.log('🚀 ~ file: checkFilterIdExists.ts:9 ~ checkFilterIdExists ~ filter:', filter);

    if (filter && filter.filterId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.error({
      error,
      msg: 'Error while checking filter id',
      fileTrace:
        'background/services/api/gmail/helper/checkFilterIdExists.ts:19 ~ checkFilterIdExists() catch block',
    });
    return false;
  }
};
