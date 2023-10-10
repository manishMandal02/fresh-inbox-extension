import { AUTH_SCOPE, storageKeys } from '../../constants/app.constants';
import { logger } from '../../utils/logger';

export const USER_ACCESS_DENIED = 'The user did not approve access.';

// custom google OAuth2 flow
const googleAuth = async (email: string, interactive: boolean): Promise<string | null> => {
  const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

  const clientId = process.env.GOOGLE_CLIENT_ID;

  //TODO: testing env variables
  console.log('🚀 ~ file: index.ts:15 ~ googleAuth ~ clientId:', clientId);

  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('scope', AUTH_SCOPE);
  authUrl.searchParams.set('login_hint', email);
  try {
    const responseURL = (await chrome.identity.launchWebAuthFlow({
      url: authUrl.href,
      interactive,
      //@ts-ignore
      abortOnLoadForNonInteractive: false,
      timeoutMsForNonInteractive: 3000,
    })) as unknown;

    if (!responseURL && typeof responseURL !== 'string') throw new Error('Failed to complete auth.');

    const token = (responseURL as string).split('#')[1]?.split('=')[1];

    if (!token) throw new Error('Token not found.');

    return token;
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
export const launchGoogleAuthFlow = async (email: string): Promise<string | null> => {
  const token = await googleAuth(email, true);
  return token;
};

// get token for already auth'ed user
export const getAuthToken = async (email: string): Promise<string | null> => {
  const token = await googleAuth(email, false);
  return token;
};

// logout user
export const logoutUser = async (token: string) => {
  try {
    // revoke token from google OAuth service (token becomes invalid)
    const url = 'https://accounts.google.com/o/oauth2/revoke?token=' + token;
    const res = await fetch(url);

    // TODO: testing token revoke
    // TODO: update storage accordingly, think...

    console.log('🚀 ~ file: index.ts:86 ~ logoutUser ~ res:', res);

    // enable app
    await chrome.storage.sync.set({ [storageKeys.IS_APP_ENABLED]: false });

    // clear token from browser cache
    await chrome.identity.clearAllCachedAuthTokens();

    logger.info('✅ Removed user auth token', 'background/services/auth/index.ts:63 ~ logoutUser()');
  } catch (error) {
    logger.error({
      error,
      msg: 'Error finding fresh inbox filter',
      fileTrace: 'background/services/auth/index.ts:68 ~ logoutUser() catch block',
    });
  }
};
