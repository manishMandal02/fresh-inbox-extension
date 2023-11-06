import { storageKeys } from '../../constants/app.constants';
import { asyncHandler } from '../../utils/asyncHandler';
import { getSyncStorageByKey } from '../../utils/getStorageByKey';

// checkbox state: don't show this message again
let isChecked: boolean | null = null;

const handleConfirmActionBtnClick = async (ev: MouseEvent, onConfirmClick: () => Promise<void>) => {
  ev.stopPropagation();
  // execute callback
  hideConfirmModal();
  //
  await onConfirmClick();
  // hide modal
};

const handleCancelActionBtnClick = (ev: MouseEvent) => {
  ev.stopPropagation();
  // hide modal
  hideConfirmModal();
};

const handleCheckboxUpdate = async (ev: Event) => {
  //@ts-ignore
  const isChecked = ev.target.checked;

  console.log('🚀 ~ file: confirmModal.ts:27 ~ handleCheckboxUpdate ~ isChecked:', isChecked);

  // update checkbox state
  // if checked, update storage (sync) to save preference (checked = user doesn't want to see this message again)
  await chrome.storage.sync.set({ [storageKeys.SHOW_DELETE_CONFIRM_MSG]: isChecked! });
};

type ShowConfirmModalParams = {
  msg: string;
  email: string;
  onConfirmClick: () => Promise<void>;
};

const showConfirmModal = async ({ msg, email, onConfirmClick }: ShowConfirmModalParams) => {
  //
  // check user preference , if the user want's to see the delete confirmation message or not
  const showDeleteConfirmMsg = await getSyncStorageByKey<boolean>('SHOW_DELETE_CONFIRM_MSG');

  if (typeof showDeleteConfirmMsg === 'boolean' && showDeleteConfirmMsg === false) {
    // user has opted not to see the confirm action msg again
    // don't show confirm delete action msg
    await onConfirmClick();
    return;
  }

  // modal elements
  const modalContainer = document.createElement('div');
  const backdrop = document.createElement('div');
  // modal card
  const modalCard = document.createElement('div');
  const modalTitle = document.createElement('p');
  const modalMessage = document.createElement('p');
  // checkbox
  const checkboxWrapper = document.createElement('div');
  const checkboxLabel = document.createElement('label');
  const checkbox = document.createElement('input');
  const buttonContainer = document.createElement('div');
  //  buttons
  const confirmAction = document.createElement('button');
  const cancelAction = document.createElement('button');

  // set inner content
  modalTitle.innerText = 'Confirm Action';
  modalMessage.innerHTML = `${msg} <br /> <strong>${email}</strong>`;
  confirmAction.innerText = 'Delete';
  cancelAction.innerText = 'Cancel';

  // set checkbox type & label
  checkbox.type = 'checkbox';
  checkboxLabel.innerText = "Don't show this message again";
  checkboxLabel.setAttribute('for', 'confirmModal-checkbox');

  // add class to elements
  modalContainer.id = 'freshInbox-confirmModal';
  backdrop.id = 'confirmModal-backdrop';
  modalCard.id = 'confirmModal-card';
  modalTitle.id = 'confirmModal-modalTitle';
  modalMessage.id = 'confirmModal-modalMessage';
  checkboxWrapper.id = 'confirmModal-checkboxWrapper';
  checkbox.id = 'confirmModal-checkbox';
  buttonContainer.id = 'confirmModal-btnContainer';
  confirmAction.id = 'confirmModal-confirmActionBtn';
  cancelAction.id = 'confirmModal-cancelActionBtn';

  // add on click lister
  // backdrop click listener
  backdrop.addEventListener('click', handleCancelActionBtnClick);

  // checkbox event listener
  checkbox.addEventListener('change', handleCheckboxUpdate);

  confirmAction.addEventListener('click', (ev: MouseEvent) => {
    asyncHandler(async () => {
      await handleConfirmActionBtnClick(ev, onConfirmClick);
    });
  });

  // disable btn
  cancelAction.addEventListener('click', handleCancelActionBtnClick);

  checkboxWrapper.append(checkbox, checkboxLabel);

  buttonContainer.append(cancelAction, confirmAction);

  modalCard.append(modalTitle, modalMessage, checkboxWrapper, buttonContainer);

  modalContainer.append(backdrop, modalCard);

  document.body.appendChild(modalContainer);
};

const hideConfirmModal = () => {
  // get elements
  const modalContainer = document.getElementById('freshInbox-confirmModal');
  const backdrop = document.getElementById('confirmModal-backdrop');

  const modalCard = document.getElementById('confirmModal-card');
  const buttonContainer = document.getElementById('confirmModal-btnContainer');

  if (!modalContainer || !backdrop || !modalCard) return;
  // remove elements
  backdrop.remove();
  buttonContainer.remove();
  modalCard.remove();
  modalContainer.remove();
};

export { showConfirmModal };
