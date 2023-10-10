import { asyncHandler } from '../../utils/asyncHandler';
import { limitCharLength } from '../../utils/limitCharLength';
import wait from '../../utils/wait';
import { getLoadingSpinner } from './loadingSpinner';

type ShowLoadingSnackbarParams = {
  title: string;
  email: string;
};

const LoadingSnackbarId = 'freshInbox-loadingSnackbar';

// loading snackbar
// show
const showLoadingSnackbar = ({ title, email }: ShowLoadingSnackbarParams) => {
  // remove previous loading snackbar if any
  const previousSnackbar = document.getElementById(LoadingSnackbarId);

  if (previousSnackbar) previousSnackbar.remove();

  // container
  const container = document.createElement('div');
  const label = document.createElement('span');

  // add label text
  label.innerHTML = `${title} <br/> <strong>${limitCharLength(email)}</strong>`;

  // add classes
  container.id = LoadingSnackbarId;

  const spinner = getLoadingSpinner();

  // append elements
  container.append(label, spinner);

  document.body.appendChild(container);
};

// hide
const hideLoadingSnackbar = () => {
  // find container element
  const container = document.getElementById(LoadingSnackbarId);
  if (!container) return;
  container.style.display = 'none';
  // removes all it's child elements
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  // remove the container el from dom
  container.remove();
};

//* general message snackbar (success/error)
type SnackbarParams = {
  title: string;
  email: string;
  isError?: boolean;
};

const showSnackbar = ({ title, email, isError }: SnackbarParams) => {
  const container = document.createElement('div');
  const label = document.createElement('span');

  const emojiIcon = !isError ? '✅' : '❌';

  // add label text
  label.innerHTML = `<b>${emojiIcon}</b>  <span>${title} <br/> <strong>${limitCharLength(
    email
  )}</strong></span>`;

  container.classList.add('freshInbox-snackbar');

  setTimeout(() => {
    container.classList.add('show');
  }, 10);

  if (!isError) {
    container.classList.add('success');
  } else {
    container.classList.add('error');
  }

  // append elements
  container.appendChild(label);

  document.body.appendChild(container);

  // remove snackbar after 3.5s
  setTimeout(
    asyncHandler(async () => {
      container.classList.remove('show');
      await wait(500);
      container.remove();
    }),
    3500
  );
};
export { showLoadingSnackbar, hideLoadingSnackbar, showSnackbar };
