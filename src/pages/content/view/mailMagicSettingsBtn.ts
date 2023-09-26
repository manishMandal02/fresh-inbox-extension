import { IMessageEvent } from '../content.types';
import { refreshEmailsTable } from '../utils/refreshEmailsTable';
import { showSettingsModal } from './settingsModal';

export const mailMagicSettingsBtn = () => {
  //main button
  const btn = document.createElement('button');

  btn.classList.add('mailMagicSettingsBtn');

  btn.innerText = 'Mail Magic';

  btn.addEventListener('click', async () => {
    // await chrome.runtime.sendMessage({ event: IMessageEvent.Disable_MailMagic });
    // await refreshEmailsTable();
    showSettingsModal();
  });

  document.body.appendChild(btn);
};
