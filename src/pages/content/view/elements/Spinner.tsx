import { useEffect } from 'react';

export const Spinner = () => {
  useEffect(() => {
    console.log('Spinner loaded');
  }, []);

  return (
    <div className='flex w-full h-full items-center justify-center'>
      <div className='border-gray-300 h-10 w-10 animate-spin rounded-full border-4 border-t-brand-primary' />
    </div>
  );
};
