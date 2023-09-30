import { getLoadingSpinner } from '../view/elements/loadingSpinner';

// show loading spinner instead of action buttons for table row when email actions is processing
export const renderLoadingSpinnerInsteadOfButtons = (btnContainerId: string) => {
  // get all the action buttons for that row
  const btnContainer = document.getElementById(btnContainerId);

  if (!btnContainer) return null;

  // hide the buttons
  for (const btn of btnContainer.getElementsByTagName('button')) {
    btn.style.display = 'none';
  }

  // create a spinner
  const spinner = getLoadingSpinner();

  // add spinner and remove buttons
  btnContainer.appendChild(spinner);

  // return a callback fn which when called will hide the loading spinner
  return (showActionButtons = false) => {
    // remove/hide spinner
    spinner.remove();

    if (showActionButtons) {
      // show the buttons
      for (const btn of btnContainer.getElementsByTagName('button')) {
        btn.style.display = 'inline-block';
      }
    }
  };
};
