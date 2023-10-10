const renderAuthTab = () => {
  // auth tab container
  const container = document.createElement('div');

  container.innerHTML = `
        <h4> 
        Fresh Inbox helps you keep your Inbox clean, <br />
        it can unsubscribe from unwanted newsletters & mailing lists, 🧹 delete 100s of emails with just a single click 
        </h4>
        <p>Checkout a quick walkthrough of Fresh Inbox to know more <a href="https://www.youtube.com/watch?v=testvideo" target='_blank' rel='noreferrer'>Link</a> </p>

        <h5> Connect Fresh Inbox to ✉️ Gmail</h5>
        <p>Fresh Inbox needs access to your Gmail account to work. Click the button below to connect.</p>

        <button id="authTab-connectButton">
            Connect to Gmail
        </button>
        <h6>No data leaves your browser, everything happens in your own system.</h6>

        <p id='authTab-disableBtn'>Disable Fresh Inbox</p>
    `;

  container.id = 'settingsModal-authTab';

  document.body.appendChild(container);

  const connectButton = document.getElementById('authTab-connectButton');

  const disableBtn = document.getElementById('authTab-disableBtn');

  connectButton.addEventListener('click', async () => {
    // call connect method
  });
};

const removeAuthTab = () => {};

export { renderAuthTab, removeAuthTab };
