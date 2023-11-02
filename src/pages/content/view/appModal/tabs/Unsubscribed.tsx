import { asyncHandler } from '@src/pages/content/utils/asyncHandler';
import { useEffect, useState } from 'react';

// get unsubscribed emails from background
const getUnsubscribedEmails = async () => {
  return [];
};

const Unsubscribed = () => {
  const [unsubscribedEmails, setUnsubscribedEmails] = useState([]);
  const [isFetchingNewsletterEmails, setIsFetchingNewsletterEmails] = useState(false);

  // get unsubscribed emails
  useEffect(
    asyncHandler(async () => {
      // set loading sta
      setIsFetchingNewsletterEmails(true);
      // get unsubscribed emails from background
      const unsubscribedEmails = await getUnsubscribedEmails();
      setUnsubscribedEmails(unsubscribedEmails);
      // reset loading state
      setIsFetchingNewsletterEmails(false);
    }),
    []
  );

  return (
    <div className='w-full h-full max-h-full'>
      <p>
        Fresh Inbox has unsubscribed <u>{unsubscribedEmails.length}</u> emails to keep your 📨 inbox clean
      </p>

      <div className='h-px w-full bg-slate-300' />

      {/* bottom container */}
      <div className='w-full h-full flex flex-col justify-center items-start'>
        {/* {isFetchingNewsletterEmails ? <Spinner size='lg' /> : renderTable()} */}
      </div>
    </div>
  );
};

export default Unsubscribed;
