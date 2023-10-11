// input Wed, Sep 6, 2023, 3:15 PM
// output 2023//09/06
const formatDate = (date: string) => new Date(date).toISOString().substring(0, 10);

export const getDateRangeFromNodes = (nodes: Element[]) => {
  //
  const endDate = nodes[0].closest('tr').querySelector('td[role=gridcell]>span[title]').getAttribute('title');
  //
  const startDate = nodes[nodes.length - 1]
    .closest('tr')
    .querySelector('td[role=gridcell]>span[title]')
    .getAttribute('title');

  console.log('🚀 ~ file: getDateRangeFromNodes.ts:8 ~ getDateRangeFromNodes ~ startDate:', startDate);

  console.log('🚀 ~ file: getDateRangeFromNodes.ts:14 ~ getDateRangeFromNodes ~ endDate:', endDate);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};
