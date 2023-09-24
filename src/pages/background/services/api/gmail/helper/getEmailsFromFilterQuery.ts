const getEmailsFromFilterQuery = (filterQuery: string) => {
  // characters to remove
  let substringsToRemove = ['from:', '(', ')'];

  let filteredString = filterQuery;
  for (const substr of substringsToRemove) {
    filteredString = filteredString.split(substr).join('');
  }

  const emails = filteredString.replace(/\s/g, '').split('OR');

  // to remove empty elements
  return emails.filter(email => email);
};

export { getEmailsFromFilterQuery }; 
