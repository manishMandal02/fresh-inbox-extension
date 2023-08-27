const renderAboutTab = (parentContainer: HTMLElement) => {
  // about tab container
  const aboutTabContainer = document.createElement('div');

  aboutTabContainer.id = 'settingsModal-aboutTab';

  // html structure
  aboutTabContainer.innerHTML = `
    <h4>Mail Magic is <strong>active</strong></h4>

    <p>
        Mail Magic helps you keep your inbox clean, it can <u> unsubscribe to unwanted emails </u> like newsletter and 
        bulk <u> delete 🧹 100s of emails in a single click</u>.
    </p>

    <p>
        <u>The best part is that no data ever leaves your browser</u>, 
        all the actions are executed on your system.

        We've open-sourced our code on 🔗 <a href="https://github.com/manishMandal02/mail-magic" target='_blank' rel='noreferrer'>Github</a>
        for you to see how Mail Magic works.
    </p>

    <p>
        A quick walkthrough of Mail Magic can help you get started,
        if you're having trouble understanding it's features 🔗 <a href="https://www.youtube.com/watch?v=testvideo" target='_blank' rel='noreferrer'>Walkthrough</a>
    </p>

    <button id='aboutTab-disableBtn'>Disable Mail Magic</button>
  `;

  parentContainer.appendChild(aboutTabContainer);

  // add event listener to disable button
  const disableBtn = document.getElementById('aboutTab-disableBtn');

  disableBtn.addEventListener('click', async ev => {
    ev.stopPropagation();
    //TODO: disable Mail Magic
  });
};
const removeAboutTab = () => {
  const aboutTabContainer = document.getElementById('settingsModal-aboutTab');

  if (!aboutTabContainer) return;

  aboutTabContainer.remove();
};

export { renderAboutTab, removeAboutTab };
