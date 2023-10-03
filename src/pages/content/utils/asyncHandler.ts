// async handler

/**
 * async handler, async fn more readable
 * @param callback an async fn to be executed
 * @returns a an async fn that calls the callback, wrapped inside a IIFE sync fn
 */

export const asyncHandler = <T = MouseEvent>(callback: (ev: T) => Promise<void>) => {
  return () => {
    (async ev => {
      await callback(ev);
    })();
  };
};
