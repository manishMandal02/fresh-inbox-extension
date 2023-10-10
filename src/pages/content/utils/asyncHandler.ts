// async handler

/**
 * async handler, async fn more readable
 * @param callback an async fn to be executed
 * @returns a an async fn that calls the callback, wrapped inside a IIFE sync fn
 */

export const asyncHandler = <T = MouseEvent>(callback: (_: null, ev: T) => Promise<void>) => {
  return () => {
    (async (_, ev) => {
      await callback(_, ev);
    })();
  };
};
