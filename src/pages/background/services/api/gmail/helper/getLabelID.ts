// get
export const getLabelID = async (token: string) => {
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

    

  } catch (err) {
    console.log('🚀 ~ file: getLabelID.ts:16 ~ getLabelID ~ err:', err);
  }
};
