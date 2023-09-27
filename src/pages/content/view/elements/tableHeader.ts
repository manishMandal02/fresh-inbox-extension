// common table header element
export const tableHeader = () => {
  const tableRow = document.createElement('tr');

  // add class name
  tableRow.classList.add('mailMagic-tableHeader');

  // inner html for table row
  tableRow.innerHTML = `
  <td>Emails</td>
  <td>Actions</td>
  `;

  return tableRow;
};
