// check if the token has expired

export const hasTokenExpired = (expiryDate: string) => {
  const now = new Date();

  return now > new Date(expiryDate);
};
