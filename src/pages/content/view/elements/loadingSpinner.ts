const getLoadingSpinner = () => {
  // container
  const spinnerContainer = document.createElement('div');
  const spinner = document.createElement('div');

  spinnerContainer.classList.add('freshInbox-spinner');

  spinnerContainer.appendChild(spinner);
  return spinnerContainer;
};

export { getLoadingSpinner };
