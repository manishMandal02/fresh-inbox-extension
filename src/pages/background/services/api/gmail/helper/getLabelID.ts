// TODO: get the label ids of TRASH & INBOX labels
// TODO: save to sync storage and keep it as we keep the filter ids (fetch from api only when not in db)
// TODO: replace the literal string value of these filter with their ids (all the apis, filters, etc.)
// ToDO:

import { FILTER_ACTION } from '@src/pages/background/types/background.types';

// get
export const getLabelID = async (token: string, filterAction: FILTER_ACTION) => {
  const fetchOptions = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', fetchOptions);

    // parsed response
    const parsedRes = await res.json();

    if (!parsedRes || !parsedRes.labels) {
      throw new Error('❌ Failed to fetch labels from Gmail API');
    }

    console.log('🚀 ~ file: getLabelID.ts:27 ~ getLabelID ~ parsedRes:', parsedRes);
  } catch (err) {
    console.log('🚀 ~ file: getLabelID.ts:16 ~ getLabelID ~ err:', err);
  }
};
