import { removeAboutTab, renderAboutTab } from './tabs/about';
import { removeNewsletterTab, renderNewsletterTab } from './tabs/newsletter';
import { removeUnsubscribedListTab, renderUnsubscribedListTab } from './tabs/unsubscribedList';

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

  // render about tab by default
  renderAboutTab(tabBodyContainer);

  // tab menu on click listener
  const aboutTab = document.getElementById('settingsTabs-about');
  const newsletterTab = document.getElementById('settingsTabs-newsletter');
  const unsubscribedList = document.getElementById('settingsTabs-unsubscribed');

  //* about tab event listener
  aboutTab.addEventListener('click', ev => {
    ev.stopPropagation();
    // if this is active tab already, do nothing
    if (activeTab === 'about') return;

    activeTab = 'about';

    // remove active class from other tabs
    newsletterTab.classList.remove('settingsModal-activeTab');
    unsubscribedList.classList.remove('settingsModal-activeTab');

    // remove tab body of other tabs

    removeNewsletterTab();

    removeUnsubscribedListTab();

    // add active class name
    aboutTab.classList.add('settingsModal-activeTab');
    // render about tab container
    renderAboutTab(tabBodyContainer);
  });

  //* newsletter tab event listener
  newsletterTab.addEventListener('click', async ev => {
    ev.stopPropagation();

    // if this is active tab already, do nothing
    if (activeTab === 'newsletter') return;

    activeTab = 'newsletter';

    // remove active class from other tabs
    aboutTab.classList.remove('settingsModal-activeTab');
    unsubscribedList.classList.remove('settingsModal-activeTab');

    // remove tab body of other tabs
    removeAboutTab();
    // remove unsubscribedList tab
    removeUnsubscribedListTab();

    newsletterTab.classList.add('settingsModal-activeTab');
    //render newsletter
    await renderNewsletterTab(tabBodyContainer);
  });

  //* unsubscribedList tab event listener
  unsubscribedList.addEventListener('click', async ev => {
    ev.stopPropagation();

    // if this is active tab already, do nothing
    if (activeTab === 'unsubscribedList') return;

    activeTab = 'unsubscribedList';

    // remove active class from other tabs
    aboutTab.classList.remove('settingsModal-activeTab');
    newsletterTab.classList.remove('settingsModal-activeTab');

    // remove tab body of other tabs
    removeAboutTab();
    // remove newsletter tab
    removeNewsletterTab();

    // add active class name
    unsubscribedList.classList.add('settingsModal-activeTab');
    // render unsubscribedList tab
    await renderUnsubscribedListTab(tabBodyContainer);
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