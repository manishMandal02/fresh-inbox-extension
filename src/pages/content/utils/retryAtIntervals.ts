import wait from './wait';

type RetryAtIntervalParams = {
  retries: number;
  interval: number;
  callback: () => Promise<boolean>;
};

// retry a logic for certain interval with certain number of retries until it succeeds
export const retryAtIntervals = async ({ retries, interval, callback }: RetryAtIntervalParams) => {
  let retry = 0;

  while (retry < retries) {
    const isSuccess = await callback();
    if (isSuccess) {
      break;
    }
    await wait(interval);
    retry++;
  }
};
