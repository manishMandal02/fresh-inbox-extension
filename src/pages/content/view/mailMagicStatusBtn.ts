import { IMessageEvent } from '../content.types';
import { refreshEmailsTable } from '../utils/refreshEmailsTable';

export const mailMagicStatusBtn = () => {
  //main button
  const btn = document.createElement('button');

  btn.classList.add('mailMagicStatusBtn');

  btn.innerText = 'Mail Magic';

  btn.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ event: IMessageEvent.LOGOUT });
    await refreshEmailsTable();
  });

  document.body.appendChild(btn);
};
