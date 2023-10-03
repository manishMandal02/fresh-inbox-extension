// async handler

/**
 * async handler, async fn more readable
 * @param callback an async fn to be executed
 * @returns a an async fn that calls the callback, wrapped inside a IIFE sync fn
 */

export const asyncHandler = (callback: () => Promise<void>) => {
  return () => {
    (async () => {
      await callback();
    })();
  };
};
