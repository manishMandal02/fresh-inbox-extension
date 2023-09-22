import { getFilterById } from './gmailFilters';

// check if filter id exists of not
export const checkFilterIdExists = async (token: string, filterId: string): Promise<boolean> => {
  try {
    const filter = await getFilterById(token, filterId);
    if (filter && filter.filterId) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log('🚀 ~ file: checkFilterIdExists.ts:8 ~ checkFilterIdExists ~ err:', err);
    return false;
  }
};
