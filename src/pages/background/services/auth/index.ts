import { AUTH_SCOPE, CLIENT_ID } from '../../constants/app.constants';
import { IUserInfo } from '../../types/background.types';
import { logger } from '../../utils/logger';

export const USER_ACCESS_DENIED = 'The user did not approve access.';

// custom google OAuth2 flow
const googleAuth = async (email: string, interactive: boolean): Promise<string | null> => {
  let redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
  // let nonce = Math.random().toString(36).substring(2, 15);
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
    const responseURL = await chrome.identity.launchWebAuthFlow({
      url: authUrl.href,
      interactive,
      //@ts-ignore
      abortOnLoadForNonInteractive: false,
      timeoutMsForNonInteractive: 3000,
    });

    if (!responseURL && typeof responseURL !== 'string') throw new Error('Failed to complete auth.');
    // if (!responseURL.split('#')) throw new Error('Token not found.');

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

// get user info: id, email
export const getUserInfo = (): Promise<IUserInfo | null> => {
  return new Promise(resolve => {
    chrome.identity.getProfileUserInfo(userInfo => {
      if (!userInfo) {
        logger.info('user info not found', 'background/services/auth/index.ts:40 ~ getUserInfo()');
        resolve(null);
      } else {
        resolve({
          userId: userInfo.id,
          email: userInfo.email,
        });
      }
    });
  });
};

// logout user
export const logoutUser = async (token: string) => {
  // return new Promise<boolean>((resolve, reject) => {
  try {
    const url = 'https://accounts.google.com/o/oauth2/revoke?token=' + token;
    await fetch(url);

    await chrome.identity.clearAllCachedAuthTokens();

    logger.info('✅ Removed user auth token', 'background/services/auth/index.ts:63 ~ logoutUser()');
  } catch (error) {
    logger.error({
      error,
      msg: 'Error finding mail magic filter',
      fileTrace: 'background/services/auth/index.ts:68 ~ logoutUser() catch block',
    });
  }
};
