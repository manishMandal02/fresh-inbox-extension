const handleCloseSettingsModal = (ev: MouseEvent) => {
  ev.stopPropagation();

  hideSettingsModal();
};

const showSettingsModal = () => {
  // modal elements
  const modalContainer = document.createElement('div');
  const backdrop = document.createElement('div');
  const modalCard = document.createElement('div');
  const closeModalBtn = document.createElement('button');

  // add content to the elements
  closeModalBtn.innerHTML = `X`;

  modalCard.innerHTML = `
    <div id='settingsModal-topContainer'>
        <div>
            <p class='modalTitle'>Mail Magic</p>
            <button>X</button>
        </div>
        <div class='tabs'>
            <li class='settingsModal-activeTab'>About</li>
            <li >Newsletter Hunt</li>
            <li >Unsubscribed Emails</li>
        </div>

    </div>

    <div id='settingsModal-tabBodyContainer'> 
        
    </div>
  
  `;

  // add id's to elements
  modalContainer.id = 'mailMagic-settingsModal';
  backdrop.id = 'settingsModal-backdrop';
  modalCard.id = 'settingsModal-card';

  // add on click lister
  // backdrop click listener
  backdrop.addEventListener('click', handleCloseSettingsModal);

  modalContainer.append(backdrop, modalCard);

  document.body.appendChild(modalContainer);
};

const hideSettingsModal = () => {
  // get elements
  const modalContainer = document.getElementById('mailMagic-settingsModal');
  const backdrop = document.getElementById('settingsModal-backdrop');
  const modalCard = document.getElementById('settingsModal-card');

  if (!modalContainer || !backdrop || !modalCard) return;
  // remove elements
  modalCard.remove();
  backdrop.remove();
  modalContainer.remove();
};

export { showSettingsModal };
