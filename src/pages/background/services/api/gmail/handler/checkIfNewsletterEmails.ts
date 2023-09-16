// check for newsletter emails on page

export const getNewsletterEmailsOnPage = async (token: string, emails: string[]) => {
  const fetchOptions = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};
