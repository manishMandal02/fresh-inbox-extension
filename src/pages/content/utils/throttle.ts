import type { AsyncCallback } from '../types/content.types';

export const throttle = (callback: AsyncCallback, delay = 1000) => {
  let timerFlag = null; // Variable to keep track of the timer

  // Returning a throttled version
  return async () => {
    if (timerFlag === null) {
      // If there is no timer currently running
      await callback(); // Execute the main function
      timerFlag = setTimeout(() => {
        // Set a timer to clear the timerFlag after the specified delay
        timerFlag = null; // Clear the timerFlag to allow the main function to be executed again
      }, delay);
    }
  };
};
