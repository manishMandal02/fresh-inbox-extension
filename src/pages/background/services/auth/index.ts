import { AUTH_SCOPE, storageKeys } from '../../constants/app.constants';
import { logger } from '../../utils/logger';
import { setStorage } from '../../utils/setStorage';

// custom google OAuth2 flow
const googleAuth = async (email: string, clientId: string, interactive: boolean): Promise<string | null> => {
  const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'userToken');
  authUrl.searchParams.set('scope', AUTH_SCOPE);
  authUrl.searchParams.set('login_hint', email);
  try {
    if (!clientId) throw new Error('No client id found.');
    const responseURL = (await chrome.identity.launchWebAuthFlow({
      interactive,
      url: authUrl.href,
      //@ts-ignore
      abortOnLoadForNonInteractive: false,
      timeoutMsForNonInteractive: 3000,
    })) as unknown;

    if (!responseURL && typeof responseURL !== 'string') throw new Error('Failed to complete auth.');

    const userToken = (responseURL as string).split('#')[1]?.split('=')[1].split('&')[0];

    if (!userToken) throw new Error('Token not found.');

    return userToken;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error authenticating user',
      fileTrace: 'background/services/auth/index.ts:21 ~ googleAuth() catch block',
    });

    return null;
  }
};

// launches google auth flow for user to grant permission to their gmail
export const launchGoogleAuthFlow = async (email: string, clientId: string): Promise<string | null> =>
  await googleAuth(email, clientId, true);

// get userToken for already auth'ed user
export const getAuthToken = async (email: string, clientId: string): Promise<string | null> =>
  await googleAuth(email, clientId, false);

// logout user
export const logoutUser = async (userToken: string, disableApp = true) => {
  try {
    // revoke userToken from google OAuth service (userToken becomes invalid)
    const url = 'https://accounts.google.com/o/oauth2/revoke?userToken=' + userToken;
    await fetch(url);

    //  update storage after app disabled

    const promises = [
      // disable app
      setStorage({ type: 'sync', key: storageKeys.IS_APP_ENABLED, value: !disableApp }),

      // clear local storage
      // set newsletter emails
      setStorage({ type: 'local', key: storageKeys.NEWSLETTER_EMAILS, value: [] }),
      // set unsubscribed emails
      setStorage({ type: 'local', key: storageKeys.UNSUBSCRIBED_EMAILS, value: [] }),
      // set whitelisted emails
      setStorage({ type: 'local', key: storageKeys.WHITELISTED_EMAILS, value: [] }),
    ];

    // wait for all promises to resolve
    // throw error if any of the promises reject to catch in the catch block
    await Promise.all(promises.map(promise => promise.catch(err => err)));

    logger.info('✅ Removed user auth userToken', 'background/services/auth/index.ts:63 ~ logoutUser()');
    return true;
  } catch (error) {
    logger.error({
      error,
      msg: 'Error finding fresh inbox filter',
      fileTrace: 'background/services/auth/index.ts:68 ~ logoutUser() catch block',
    });
    return false;
  }
};
