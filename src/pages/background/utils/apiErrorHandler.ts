// common error messages
export const errorMessage = {
  unauthorized: 'Unauthorized',
  apiLimitExceed: 'api-limit-exceed',
  somethingWentWrong: 'something-went-wrong',
};

export const apiErrorHandler = (parsedRes: any) => {
  if (!parsedRes?.error) return true;

  if (parsedRes?.error?.code === 401) {
    throw new Error(errorMessage.unauthorized);
  }

  if (parsedRes?.error?.code === 403) {
    throw new Error(errorMessage.apiLimitExceed);
  }
  // other errors
  if (parsedRes?.error?.code.toString()[0] === '5' || parsedRes?.error?.code.toString()[0] === '4') {
    throw new Error(errorMessage.somethingWentWrong);
  }
  return true;
};
