import { asyncHandler } from '../utils/asyncHandler';
import { addTooltip } from './elements/tooltip';
import { showSettingsModal } from './settingsModal';

export const embedFreshInboxSettingsBtn = () => {
  //main button
  const btn = document.createElement('button');

  btn.id = 'freshInboxSettingsBtn';

  btn.innerText = '✉️ Fresh Inbox';

  console.log('🚀 ~ file: freshInboxSettingsBtn.ts:12 ~ embedFreshInboxSettingsBtn ~ btn:', btn);

  btn.addEventListener(
    'click',
    asyncHandler(async () => {
      showSettingsModal();
    })
  );

  // add tooltip to btn

  // addTooltip(btn, 'Fresh Inbox Settings');

  document.body.appendChild(btn);
};

//TODO: finish this function
export const updateFreshInboxSettingsBtn = () => {
  //main button
  const settingsBtn = document.getElementById('freshInboxSettingsBtn');

  if (!settingsBtn) return;

  settingsBtn.classList.add('inactive');
};
