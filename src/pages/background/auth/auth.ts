import { userInfo } from 'os';

type GetAuthTokenSuccessResponse = {
  token: string;
};
type GetAuthTokenErrorResponse = {
  error: string;
};

export const USER_ACCESS_DENIED = 'The user did not approve access.';

type GetAutTokenResponse = GetAuthTokenSuccessResponse | GetAuthTokenErrorResponse;

// launches google auth flow for user to grant permission to their gmail
const launchGoogleAuthFlow = async (userId: string): Promise<GetAutTokenResponse> => {
  try {
    const token = await chrome.identity.getAuthToken({ interactive: true, account: { id: userId } });

    console.log('🚀 ~ file: auth.ts:4 ~ getGoogleAccounts ~ accounts:', token);
    return { token: token.token };
  } catch (err) {
    if (err === USER_ACCESS_DENIED) {
      return { error: USER_ACCESS_DENIED };
    }
    return { error: '❌ Failed to get token' };
  }
  return { error: '❌ Failed to get userInfo.' };
};

// get token for already auth'ed user
const getAuthToken = async (userId: string): Promise<GetAutTokenResponse> => {
  try {
    const token = await chrome.identity.getAuthToken({ interactive: false, account: { id: userId } });
    return { token: token.token };
  } catch (err) {
    return { error: '❌ Failed to get token' };
  }
};

type GetUserInfoResponse = {
  email: string;
  userId: string;
};

// get user info: id, email
const getUserInfo = (): GetUserInfoResponse | null => {
  chrome.identity.getProfileUserInfo(userInfo => {
    if (userInfo) {
      return { userId: userInfo.id, email: userInfo.email };
    } else {
      console.log('❌ Failed to get user info');
      return null;
    }
  });
  return null;
};

export { launchGoogleAuthFlow, getUserInfo, getAuthToken };
