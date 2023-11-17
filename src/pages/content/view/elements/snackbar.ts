import { asyncHandler } from '../../utils/asyncHandler';
import { limitCharLength } from '../../utils/limitCharLength';
import wait from '../../utils/wait';
import { getLoadingSpinner } from './loadingSpinner';

type ShowLoadingSnackbarParams = {
  title: string;
  emails: string[];
};

const successIconSvg =
  '<svg width="147px" height="147px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M0 7.5C0 3.35786 3.35786 0 7.5 0C11.6421 0 15 3.35786 15 7.5C15 11.6421 11.6421 15 7.5 15C3.35786 15 0 11.6421 0 7.5ZM7.0718 10.7106L11.3905 5.31232L10.6096 4.68762L6.92825 9.2893L4.32012 7.11586L3.67993 7.88408L7.0718 10.7106Z" fill="#000000"></path> </g></svg>';

const errorIconSvg =
  '<svg viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>error-filled</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="add" fill="#000000" transform="translate(42.666667, 42.666667)"> <path d="M213.333333,3.55271368e-14 C331.136,3.55271368e-14 426.666667,95.5306667 426.666667,213.333333 C426.666667,331.136 331.136,426.666667 213.333333,426.666667 C95.5306667,426.666667 3.55271368e-14,331.136 3.55271368e-14,213.333333 C3.55271368e-14,95.5306667 95.5306667,3.55271368e-14 213.333333,3.55271368e-14 Z M262.250667,134.250667 L213.333333,183.168 L164.416,134.250667 L134.250667,164.416 L183.168,213.333333 L134.250667,262.250667 L164.416,292.416 L213.333333,243.498667 L262.250667,292.416 L292.416,262.250667 L243.498667,213.333333 L292.416,164.416 L262.250667,134.250667 Z" id="Combined-Shape"> </path> </g> </g> </g></svg>';

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

  let emailMessage = '';
  if (emails && emails.length > 0) emails.length > 1 ? `${emails.length} emails` : limitCharLength(emails[0]);

  // add label text
  label.innerHTML = `${title} <br/> ${emailMessage && `<strong>${emailMessage}</strong>`}`;

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

  console.log('🚀 ~ file: snackbar.ts:78 ~ showSnackbar ~ title:', title);

  const container = document.createElement('div');
  const label = document.createElement('span');

  let snackbarIcon = successIconSvg;

  let emailMessage: string = '';

  if ('isError' in params) {
    // error emoji icon
    snackbarIcon = errorIconSvg;
    // error class
    container.classList.add('error');
  } else if (params.emails && params.emails.length > 0) {
    const emails = params.emails;
    emailMessage = emails.length > 1 ? `${emails.length} emails` : limitCharLength(emails[0], 42);
    // success class
    container.classList.add('success');
  }

  // add label text
  label.innerHTML = `
  <span class='icon-wrapper'>
  ${snackbarIcon}
  </span>
  <span class='snackbar-message'>
  ${title} 
  ${emailMessage && `<br/> <p>${emailMessage}</p>`}
  </span>
  `;

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
