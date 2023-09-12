const getEmailsFromFilterQuery = (filterQuery: string) => {
  let emails = filterQuery.replace(/[\{\}\s]/g, '').split('from:');

  // to remove empty elements
  return emails.filter(email => email);
};

export { getEmailsFromFilterQuery };
