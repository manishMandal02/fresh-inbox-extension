const getLoadingSpinner = () => {
  // container
  const spinnerContainer = document.createElement('div');
  const spinner = document.createElement('div');

  spinnerContainer.classList.add('mailMagic-spinner');

  spinnerContainer.appendChild(spinner);
  return spinnerContainer;
};

export { getLoadingSpinner };
