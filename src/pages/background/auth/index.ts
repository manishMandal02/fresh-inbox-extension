import { IUserInfo } from '../background.types';

export const USER_ACCESS_DENIED = 'The user did not approve access.';

type GetAutTokenResponse = {
  token?: string;
  error?: string;
};

// launches google auth flow for user to grant permission to their gmail
const launchGoogleAuthFlow = async (userId: string): Promise<GetAutTokenResponse> => {
  try {
    const res = await chrome.identity.getAuthToken({ interactive: true, account: { id: userId } });

    console.log('🚀 ~ file: index.ts:15 ~ launchGoogleAuthFlow ~ res:', res);

    return { token: res.token };
  } catch (err) {
    if (err === USER_ACCESS_DENIED) {
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
  } catch (err) {
    return { error: '❌ Failed to get token' };
  }
};

// get user info: id, email
const getUserInfo = (): Promise<IUserInfo | null> => {
  return new Promise(resolve => {
    chrome.identity.getProfileUserInfo(userInfo => {
      if (!userInfo) {
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

    // chrome.identity.removeCachedAuthToken({ token: token }, function () {
    // });
    await chrome.identity.clearAllCachedAuthTokens();
    console.log('Removed cached auth token');
  } catch (err) {
    console.log('🚀 ~ file: index.ts:61 ~ clearToken: Failed to revoke token: ~ err:', err);
  }
  // });
};

export { launchGoogleAuthFlow, getUserInfo, getAuthToken, clearToken };
