import { IUserInfo } from '../../types/background.types';
import { logger } from '../../utils/logger';

export const USER_ACCESS_DENIED = 'The user did not approve access.';

type GetAutTokenResponse = {
  token?: string;
  error?: string;
};

// launches google auth flow for user to grant permission to their gmail
const launchGoogleAuthFlow = async (userId: string): Promise<GetAutTokenResponse> => {
  try {
    const res = await chrome.identity.getAuthToken({ interactive: true, account: { id: userId } });

    return { token: res.token };
  } catch (error) {
    logger.error({
      error,
      msg: 'Error authenticating user',
      fileTrace: 'background/services/auth/index.ts:21 ~ launchGoogleAuthFlow() catch block',
    });
    // TODO: handle user access denied, not correct
    if (error === USER_ACCESS_DENIED) {
      return { error: USER_ACCESS_DENIED };
    }
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
    var url = 'https://accounts.google.com/o/oauth2/revoke?token=' + token;
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
