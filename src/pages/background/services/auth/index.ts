import { IUserInfo } from '../../types/background.types';
import { logger } from '../../utils/logger';

export const USER_ACCESS_DENIED = 'The user did not approve access.';

type GetAutTokenResponse = {
  token?: string;
  error?: string;
};

// launches google auth flow for user to grant permission to their gmail
const launchGoogleAuthFlow = async (userId: string): Promise<GetAutTokenResponse> => {
  let clientId = '145716100092-ivrvur7d0s0bugdgq4ueinf646q8ih7b.apps.googleusercontent.com';
  let redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
  let nonce = Math.random().toString(36).substring(2, 15);
  try {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    // Add the OpenID scope. Scopes allow you to access the user’s information.
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('nonce', nonce);
    // Show the consent screen after login.
    authUrl.searchParams.set('prompt', 'consent');

    //

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.href,
        interactive: true,
      },
      redirectUrl => {
        if (redirectUrl) {
          // The ID token is in the URL hash
          const urlHash = redirectUrl.split('#')[1];
          const params = new URLSearchParams(urlHash);
          const jwt = params.get('id_token');

          console.log('🔥 ~ file: index.ts:42 ~ launchGoogleAuthFlow ~ jwt:', jwt);

          // Parse the JSON Web Token
          const base64Url = jwt.split('.')[1];
          const base64 = base64Url.replace('-', '+').replace('_', '/');
          const parsedJWT = JSON.parse(atob(base64));

          //
          const email = parsedJWT.email;
          const name = parsedJWT.given_name;
          const token = jwt;

          console.log('🔥 🔥 ~ file: index.ts:49 ~ launchGoogleAuthFlow ~ parsedJWT:', parsedJWT);
        }
      }
    );
  } catch (error) {
    logger.error({
      error,
      msg: 'Error authenticating user',
      fileTrace: 'background/services/auth/index.ts:21 ~ launchGoogleAuthFlow() catch block',
    });

    return { error: '❌ Failed to get token' };
  }
};

// get token for already auth'ed user
const getAuthToken = async (userId: string): Promise<GetAutTokenResponse> => {
  try {
    const res = await chrome.identity.getAuthToken({ interactive: false, account: { id: userId } });
    return { token: res.token };
  } catch (error) {
    logger.error({
      error,
      msg: 'Error getting user auth token',
      fileTrace: 'background/services/auth/index.ts:34 ~ getAuthToken() catch block',
    });
    return { error: '❌ Failed to get token' };
  }
};

// get user info: id, email
const getUserInfo = (): Promise<IUserInfo | null> => {
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

const clearToken = async (token: string) => {
  // return new Promise<boolean>((resolve, reject) => {
  try {
    const url = 'https://accounts.google.com/o/oauth2/revoke?token=' + token;
    await fetch(url);

    await chrome.identity.clearAllCachedAuthTokens();

    logger.info('✅ Removed user auth token', 'background/services/auth/index.ts:63 ~ clearToken()');
  } catch (error) {
    logger.error({
      error,
      msg: 'Error finding mail magic filter',
      fileTrace: 'background/services/auth/index.ts:68 ~ clearToken() catch block',
    });
  }
};

export { launchGoogleAuthFlow, getUserInfo, getAuthToken, clearToken };
