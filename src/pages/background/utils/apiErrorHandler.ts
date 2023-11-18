// common error messages
export const errorMessage = {
  unauthorized: 'Unauthorized',
  apiLimitExceed: 'api-limit-exceed',
  somethingWentWrong: 'something-went-wrong',
};

export const apiErrorHandler = (parsedRes: any) => {
  if (!parsedRes?.error) return true;

  console.log('🚀 ~ file: logger.ts:16 ~ catchAPIErrors ~ parsedRes?.error:', parsedRes?.error);

  if (parsedRes?.error?.code === 401) {
    throw new Error(errorMessage.unauthorized);
  }

  if (parsedRes?.error?.code === 403) {
    throw new Error(errorMessage.apiLimitExceed);
  }
  if (parsedRes?.error?.code === 500) {
    throw new Error(errorMessage.somethingWentWrong);
  }
  return true;
};
