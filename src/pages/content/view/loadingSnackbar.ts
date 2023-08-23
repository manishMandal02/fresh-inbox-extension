const showLoadingSnackbar = (title: string) => {
  // container
  const container = document.createElement('div');
  const label = document.createElement('p');
  const loader = document.createElement('div');

  // add label text
  label.innerHTML = title;

  // add classes
  container.id = 'mailMagic-loadingSnackbar';
  label.id = 'loadingSnackbar-label';
  loader.id = 'loadingSnackbar-loader';

  // append elements
  container.append(label, loader);

  document.body.appendChild(container);
};

const hideLoadingSnackbar = () => {
  // find container element
  const container = document.getElementById('mailMagic-loadingSnackbar');
  if (!container) return;
  container.style.display = 'none';
  // removes all it's child elements
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  // remove the container el from dom
  container.remove();
};

export { showLoadingSnackbar, hideLoadingSnackbar };
