import { type } from 'os';
import { asyncHandler } from '../../utils/asyncHandler';
import { limitCharLength } from '../../utils/limitCharLength';
import wait from '../../utils/wait';
import { getLoadingSpinner } from './loadingSpinner';

type ShowLoadingSnackbarParams = {
  title: string;
  emails: string[];
};

const LoadingSnackbarId = 'freshInbox-loadingSnackbar';

// loading snackbar
// show
const showLoadingSnackbar = ({ title, emails }: ShowLoadingSnackbarParams) => {
  // remove previous loading snackbar if any
  const previousSnackbar = document.getElementById(LoadingSnackbarId);

  if (previousSnackbar) previousSnackbar.remove();

  // container
  const container = document.createElement('div');
  const label = document.createElement('span');

  const emailMessage = emails.length > 1 ? `${emails.length} emails` : limitCharLength(emails[0]);

  // add label text
  label.innerHTML = `${title} <br/> <strong>${emailMessage}</strong>`;

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
  container.replaceChildren();
  // remove the container el from dom
  container.remove();
};

// general message snackbar (success/error)
type SuccessSnackbarParams = {
  title: string;
  emails: string[];
};

type ErrorSnackbarParams = {
  title: string;
  isError: boolean;
};

type ErrorType = true;

type SnackbarParams<IsError> = IsError extends ErrorType ? ErrorSnackbarParams : SuccessSnackbarParams;

const showSnackbar = <IsError>(params: SnackbarParams<IsError>) => {
  const { title } = params;

  const container = document.createElement('div');
  const label = document.createElement('span');

  let emojiIcon = '✅';

  let emails: string[] = [];

  if ('isError' in params) {
    // error emoji icon
    emojiIcon = '❌';
    // error class
    container.classList.add('error');
  } else {
    emails = params.emails;
    // success class
    container.classList.add('success');
  }

  const emailMessage = emails.length > 1 ? `${emails.length} emails` : limitCharLength(emails[0]);

  // add label text
  label.innerHTML = `<b>${emojiIcon}</b>  <span>${title} <br/> <strong>${emailMessage}</strong></span>`;

  container.classList.add('freshInbox-snackbar');

  setTimeout(() => {
    container.classList.add('show');
  }, 10);

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
