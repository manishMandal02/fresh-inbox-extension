import { asyncHandler } from '../utils/asyncHandler';
import { showSettingsModal } from './settingsModal';

export const mailMagicSettingsBtn = () => {
  //main button
  const btn = document.createElement('button');

  btn.id = 'mailMagicSettingsBtn';

  btn.innerText = 'Mail Magic';

  btn.addEventListener(
    'click',
    asyncHandler(async () => {
      showSettingsModal();
    })
  );

  document.body.appendChild(btn);
};

//TODO: finish this function
export const updateMailMagicSettingsBtn = () => {
  //main button
  const settingsBtn = document.getElementById('.mailMagicSettingsBtn');
  if (!settingsBtn) return;

  settingsBtn.classList.add('inactive');
};
