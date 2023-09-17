// input Wed, Sep 6, 2023, 3:15 PM
// output 2023//09/06
const formatDate = (date: string) => {
  return new Date(date).toISOString().substring(0, 10);
};

export const getDateRangeFromNodes = (nodes: Element[]) => {
  let startDate = nodes[0].closest('tr').querySelector('td[role=gridcell]>span[title]').getAttribute('title');
  let endDate = nodes[nodes.length - 1]
    .closest('tr')
    .querySelector('td[role=gridcell]>span[title]')
    .getAttribute('title');
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};
