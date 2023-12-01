// check if  the gmail web app is loaded fully, (check for logo or some important btn) with retry mechanism

import { retryAtIntervals } from '../../../utils/retryAtIntervals';

const queryEmailId = (): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    // get user profile button
    const userProfileBtn = document.querySelector('a[aria-label*="Google Account"]');

    if (!userProfileBtn) reject(null);

    // get the email string from the profile button aria-label attribute
    const stringWIthEmail = userProfileBtn.getAttribute('aria-label');

    // match email string with regex
    const email = stringWIthEmail.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)[0];

    if (!email) reject(null);
    resolve(email);
  });
  //
};

export const getUserEmailIdFromPage = async (): Promise<string | null> => {
  // queries email id from on the page
  // reties 3 times with interval of 2s
  let email = '';
  await retryAtIntervals({
    retries: 10,
    interval: 1500,
    callback: async () => {
      const userEmail = await queryEmailId();

      if (userEmail) {
        email = userEmail;
        return true;
      }
    },
  });

  if (!email) return null;

  return email;
};
