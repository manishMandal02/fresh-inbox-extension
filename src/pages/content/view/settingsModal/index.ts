import { removeAboutTab, renderAboutTab } from './tabs/aboutTab';

const handleCloseSettingsModal = (ev: MouseEvent) => {
  ev.stopPropagation();

  hideSettingsModal();
};

type ActiveTab = 'about' | 'newsletter' | 'unsubscribedList';

let activeTab: ActiveTab = 'about';

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
            <li class='settingsModal-activeTab' id='settingsTabs-about'>About</li>
            <li id='settingsTabs-newsletter'>Newsletter Hunt</li>
            <li id='settingsTabs-unsubscribed'>Unsubscribed Emails</li>
        </div>

    </div>

    <div id='settingsModal-tabBodyContainer'> 
        
    </div>
  
  `;

  // add id's to elements
  modalContainer.id = 'mailMagic-settingsModal';
  backdrop.id = 'settingsModal-backdrop';
  modalCard.id = 'settingsModal-card';

  // add on click listener to buttons
  // backdrop click listener
  backdrop.addEventListener('click', handleCloseSettingsModal);

  // append elements
  modalContainer.append(backdrop, modalCard);

  document.body.appendChild(modalContainer);

  // tab body container
  const tabBodyContainer = document.getElementById('settingsModal-tabBodyContainer');

  // tab menu on click listener
  const aboutTab = document.getElementById('settingsTabs-about');
  const newsletterTab = document.getElementById('settingsTabs-newsletter');
  const unsubscribedList = document.getElementById('settingsTabs-unsubscribed');

  aboutTab.addEventListener('click', ev => {
    ev.stopPropagation();
    activeTab = 'about';

    // remove active class from other tabs
    newsletterTab.classList.remove('settingsModal-activeTab');
    unsubscribedList.classList.remove('settingsModal-activeTab');

    // remove tab body of other tabs
    //TODO: remove newsletter tab
    //TODO: remove unsubscribedList tab

    // add active class name
    aboutTab.classList.add('settingsModal-activeTab');
    // render about tab container
    renderAboutTab(tabBodyContainer);
  });
  newsletterTab.addEventListener('click', ev => {
    ev.stopPropagation();
    activeTab = 'newsletter';

    // remove active class from other tabs
    aboutTab.classList.remove('settingsModal-activeTab');
    unsubscribedList.classList.remove('settingsModal-activeTab');

    // remove tab body of other tabs
    removeAboutTab();
    //TODO: remove unsubscribedList tab

    newsletterTab.classList.add('settingsModal-activeTab');
    //TODO: render newsletter
  });
  unsubscribedList.addEventListener('click', ev => {
    ev.stopPropagation();
    activeTab = 'unsubscribedList';
    // remove active class from other tabs
    aboutTab.classList.remove('settingsModal-activeTab');
    newsletterTab.classList.remove('settingsModal-activeTab');

    // remove tab body of other tabs
    removeAboutTab();
    //TODO: remove newsletter tab

    // add active class name
    unsubscribedList.classList.add('settingsModal-activeTab');
    //TODO: render unsubscribedList tab
  });
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
