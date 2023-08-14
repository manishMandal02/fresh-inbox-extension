const unsubscribe = async (email: string, token: string) => {};

const deleteAllMails = async (email: string, token: string) => {
  const fetchOptions: Partial<RequestInit> = {
    method: 'GET',

    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const queryParams = `from:${email}`;

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${queryParams}`,
    fetchOptions
  );

  console.log('🚀 ~ file: gmailService.ts:18 ~ deleteAllMails ~ res:', await res.json());
};

const unsubscribeAndDeleteAllMails = async (email: string, token: string) => {};

export { unsubscribe, deleteAllMails };
