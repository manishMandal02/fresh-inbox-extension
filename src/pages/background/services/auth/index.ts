import { IUserInfo } from '../../types/background.types';
import { logger } from '../../utils/logger';

export const USER_ACCESS_DENIED = 'The user did not approve access.';

type GetAutTokenResponse = {
  token?: string;
  error?: string;
};

// launches google auth flow for user to grant permission to their gmail
const launchGoogleAuthFlow = async (email: string): Promise<GetAutTokenResponse> => {
  let clientId = '145716100092-ivrvur7d0s0bugdgq4ueinf646q8ih7b.apps.googleusercontent.com';
  let redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
  // let nonce = Math.random().toString(36).substring(2, 15);

  const scope = `openid email https://mail.google.com https://www.googleapis.com/auth/gmail.settings.basic`;
  try {
    // TODO:
    // change response type to code (get access & refresh tokens)

    // send email as intent

    // try to set the maximum age for the token

    // store these token with expiry time (email, access token,  refresh token, expiry time)

    // this store will define if the user is logged in or not

    // we can check the token validity each time we make a call to google api

    //

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    // login type
    // authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('response_type', 'token');
    // Add the OpenID scope. Scopes allow you to access the user’s information.
    authUrl.searchParams.set('scope', scope);
    // authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('login_hint', 'mmjdd67@gmail.com');
    // consent prompt, (none shows no consent screen)
    // authUrl.searchParams.set('prompt', 'none');

    //

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.href,
        interactive: false,
      },
      redirectUrl => {
        if (redirectUrl) {
          console.log('🚀 ~ file: index.ts:56 ~ launchGoogleAuthFlow ~ redirectUrl:', redirectUrl);

          const token = redirectUrl.split('#')[1]?.split('=')[1];

          if (!token) throw new Error('Token not found.');

          return token;
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
    // const url = 'https://accounts.google.com/o/oauth2/revoke?token=' + token;
    // await fetch(url);

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
