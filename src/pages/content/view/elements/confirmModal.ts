const handleConfirmActionBtnClick = async (ev: MouseEvent, onConfirmClick: () => Promise<void>) => {
  ev.stopPropagation();
  // execute callback
  await onConfirmClick();
  // hide modal
  hideConfirmModal();
};
const handleCancelActionBtnClick = (ev: MouseEvent) => {
  ev.stopPropagation();
  // hide modal
  hideConfirmModal();
};

type ShowConfirmModalParams = {
  msg: string;
  email: string;
  onConfirmClick: () => Promise<void>;
};

const showConfirmModal = ({ msg, email, onConfirmClick }: ShowConfirmModalParams) => {
  // modal elements
  const modalContainer = document.createElement('div');
  const backdrop = document.createElement('div');
  const modalCard = document.createElement('div');
  const modalTitle = document.createElement('p');
  const modalMessage = document.createElement('p');
  const buttonContainer = document.createElement('div');
  const confirmAction = document.createElement('button');
  const cancelAction = document.createElement('button');

  // add content to the elements
  modalTitle.innerText = 'Confirm Action';
  modalMessage.innerHTML = `${msg} <br /> <strong>${email}</strong>`;
  confirmAction.innerText = 'Delete';
  cancelAction.innerText = 'Cancel';

  // add class to elements
  modalContainer.id = 'mailMagic-confirmModal';
  backdrop.id = 'confirmModal-backdrop';
  modalCard.id = 'confirmModal-card';
  modalTitle.id = 'confirmModal-modalTitle';
  modalMessage.id = 'confirmModal-modalMessage';
  buttonContainer.id = 'confirmModal-btnContainer';
  confirmAction.id = 'confirmModal-confirmActionBtn';
  cancelAction.id = 'confirmModal-cancelActionBtn';

  // add on click lister
  // backdrop click listener
  backdrop.addEventListener('click', handleCancelActionBtnClick);
  //
  // modalCard.addEventListener('click', handleCancelActionBtnClick);
  // auth btn
  confirmAction.addEventListener('click', async ev => {
    await handleConfirmActionBtnClick(ev, onConfirmClick);
  });
  // disable btn
  cancelAction.addEventListener('click', handleCancelActionBtnClick);

  buttonContainer.append(cancelAction, confirmAction);

  modalCard.append(modalTitle, modalMessage, buttonContainer);

  modalContainer.append(backdrop, modalCard);

  document.body.appendChild(modalContainer);
};

const hideConfirmModal = () => {
  // get elements
  const modalContainer = document.getElementById('mailMagic-confirmModal');
  const backdrop = document.getElementById('confirmModal-backdrop');
  const modalCard = document.getElementById('confirmModal-card');
  const buttonContainer = document.getElementById('confirmModal-btnContainer');

  if (!modalContainer || !backdrop || !modalCard || !buttonContainer) return;
  // remove elements
  buttonContainer.remove();
  modalCard.remove();
  backdrop.remove();
  modalContainer.remove();
};

export { showConfirmModal };
