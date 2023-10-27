import { asyncHandler } from '../utils/asyncHandler';
import { renderAuthModal } from './authModal';
import { addTooltip } from './elements/tooltip';
import { renderSettingsModal } from './appModal/index-old';

type SettingsBtnParams = {
  isDisabled?: boolean;
};

// embed settings button at the top-right beside profile/support button
export const embedFreshInboxSettingsBtn = ({ isDisabled }: SettingsBtnParams) => {
  //main button
  const btn = document.createElement('button');

  btn.id = 'freshInboxSettingsBtn';

  btn.innerText = !isDisabled ? '✉️ Fresh Inbox' : '❌ Fresh Inbox';

  // add inaction class if disabled
  if (isDisabled) btn.classList.add('inactive');

  // set position
  btn.style.position = 'fixed';

  btn.addEventListener(
    'click',
    asyncHandler(async () => {
      if (isDisabled) {
        renderAuthModal();
      } else {
        renderSettingsModal();
      }
    })
  );

  // add tooltip to btn

  const toolTipText = isDisabled ? 'Fresh Inbox is disabled' : 'Fresh Inbox Options';

  addTooltip(btn, toolTipText);

  document.body.appendChild(btn);
};

// update fresh inbox settings btn (color & emoji update based on app status )
export const updateFreshInboxSettingsBtn = ({ isDisabled }: SettingsBtnParams) => {
  //main button
  const settingsBtn = document.getElementById('freshInboxSettingsBtn');

  if (!settingsBtn) return;

  settingsBtn.innerText = !isDisabled ? '✉️ Fresh Inbox' : '❌ Fresh Inbox';

  const toolTipText = isDisabled ? 'Fresh Inbox is disabled' : 'Fresh Inbox Options';

  addTooltip(settingsBtn, toolTipText);

  if (isDisabled) {
    settingsBtn.classList.add('inactive');
  }
};
