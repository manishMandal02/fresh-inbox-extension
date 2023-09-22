import { getLoadingSpinner } from '../view/elements/loadingSpinner';

// show loading spinner instead of action buttons for table row when email actions is processing
export const renderLoadingSpinnerInsteadOfButtons = (tableRow: HTMLTableRowElement) => {
  // get all the action buttons for that row
  const actionBtnContainer = tableRow.getElementsByTagName('div')?.[0];
  // storing the buttons because we will re-add them, if action fails

  // hide the buttons
  for (const btn of actionBtnContainer.getElementsByTagName('button')) {
    btn.style.display = 'none';
  }

  // create a spinner
  const spinner = getLoadingSpinner();

  // add spinner and remove buttons
  actionBtnContainer.appendChild(spinner);

  // return a callback fn which when called will hide the loading spinner
  return (showActionButtons?: boolean) => {
    // remove/hide spinner
    spinner.remove();

    if (showActionButtons) {
      // show the buttons
      for (const btn of actionBtnContainer.getElementsByTagName('button')) {
        btn.style.display = 'inline-block';
      }
    }
  };
};
