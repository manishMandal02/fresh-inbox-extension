const handleCloseSettingsModal = (ev: MouseEvent) => {
  ev.stopPropagation();

  hideSettingsModal();
};

type ActiveTab = 'about' | 'newsletter' | 'unsubscribedList' | 'whitelistedEmails';

let activeTab: ActiveTab = 'about';

const renderSettingsModal = () => {
  // modal elements
  const modalContainer = document.createElement('div');
  const backdrop = document.createElement('div');
  const modalCard = document.createElement('div');

  // add inner html body
  modalCard.innerHTML = `
    <div id='settingsModal-topContainer'>
        <div>
            <p class='modalTitle'>Fresh Inbox</p>
            <button id='settingsModal-closeBtn'>X</button>
        </div>
        <div class='tabs'>
            <li class='settingsModal-activeTab' id='settingsTabs-about'>About</li>
            <li id='settingsTabs-newsletter'>Newsletter Hunt</li>
            <li id='settingsTabs-unsubscribed'>Unsubscribed Emails</li>
            <li id='settingsTabs-whitelisted'>Whitelisted Emails</li>
        </div>

    </div>

    <div id='settingsModal-tabBodyContainer'> 
        
    </div>
  
  `;

  // add id's to elements
  modalContainer.id = 'freshInbox-settingsModal';
  backdrop.id = 'settingsModal-backdrop';
  modalCard.id = 'settingsModal-card';

  // add on click listener to buttons
  // backdrop click listener
  backdrop.addEventListener('click', handleCloseSettingsModal);

  // append elements
  modalContainer.append(backdrop, modalCard);

  document.body.appendChild(modalContainer);

  // handle close button click
  const closeBtn = document.getElementById('settingsModal-closeBtn');

  closeBtn.addEventListener('click', handleCloseSettingsModal);

  // tab body container
  const tabBodyContainer = document.getElementById('settingsModal-tabBodyContainer');

  // render about tab by default
  // renderAboutTab(tabBodyContainer);

  // tab menu on click listener
  const aboutTab = document.getElementById('settingsTabs-about');
  const newsletterTab = document.getElementById('settingsTabs-newsletter');
  const unsubscribedList = document.getElementById('settingsTabs-unsubscribed');
  const whitelistedEmailsTab = document.getElementById('settingsTabs-whitelisted');

  //* about tab event listener
  aboutTab.addEventListener('click', ev => {
    ev.stopPropagation();
    // if this is active tab already, do nothing
    if (activeTab === 'about') return;

    activeTab = 'about';

    // remove active class from other tabs
    newsletterTab.classList.remove('settingsModal-activeTab');
    unsubscribedList.classList.remove('settingsModal-activeTab');
    whitelistedEmailsTab.classList.remove('settingsModal-activeTab');

    // remove tab body of other tabs
    // removeNewsletterTab();
    // removeUnsubscribedListTab();
    // removeWhitelistedEmailsTab();

    // add active class name
    aboutTab.classList.add('settingsModal-activeTab');
    // render about tab container
    // renderAboutTab(tabBodyContainer);
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
    whitelistedEmailsTab.classList.remove('settingsModal-activeTab');

    // remove tab body of other tabs
    // removeAboutTab();
    // removeUnsubscribedListTab();
    // removeWhitelistedEmailsTab();

    newsletterTab.classList.add('settingsModal-activeTab');
    //render newsletter
    // await renderNewsletterTab(tabBodyContainer);
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
    whitelistedEmailsTab.classList.remove('settingsModal-activeTab');

    // remove tab body of other tabs
    // removeAboutTab();
    // removeNewsletterTab();
    // removeWhitelistedEmailsTab();

    // add active class name
    unsubscribedList.classList.add('settingsModal-activeTab');
    // render unsubscribedList tab
    // await renderUnsubscribedListTab(tabBodyContainer);
  });

  whitelistedEmailsTab.addEventListener('click', async ev => {
    ev.stopPropagation();

    // if this is active tab already, do nothing
    if (activeTab === 'whitelistedEmails') return;

    activeTab = 'whitelistedEmails';

    // remove active class from other tabs
    aboutTab.classList.remove('settingsModal-activeTab');
    newsletterTab.classList.remove('settingsModal-activeTab');
    unsubscribedList.classList.remove('settingsModal-activeTab');

    // remove tab body of other tabs
    // removeAboutTab();
    // removeNewsletterTab();
    // removeUnsubscribedListTab();

    // add active class name
    whitelistedEmailsTab.classList.add('settingsModal-activeTab');
    // render unsubscribedList tab
    // await renderWhitelistedEmailsTab(tabBodyContainer);
  });
};

const hideSettingsModal = () => {
  // get elements
  const modalContainer = document.getElementById('freshInbox-settingsModal');
  const backdrop = document.getElementById('settingsModal-backdrop');
  const modalCard = document.getElementById('settingsModal-card');

  if (!modalContainer || !backdrop || !modalCard) return;

  // remove child elements
  for (const child of modalCard.children) {
    child.remove();
  }
  // remove main elements
  modalContainer.remove();
  backdrop.remove();
  modalCard.remove();
};

export { renderSettingsModal, hideSettingsModal };
