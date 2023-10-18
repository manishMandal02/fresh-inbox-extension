import { asyncHandler } from '@src/pages/content/utils/asyncHandler';
import { useEffect, useState } from 'react';
import { Spinner } from '../../elements/Spinner';
import { Checkbox } from '../../elements/Checkbox';

type NewsletterData = {
  email: string;
  name: string;
};

const data: NewsletterData[] = [
  { email: 'test1@gmail.com', name: 'test mandal' },
  { email: 'test2@gmail.com', name: 'test mandal' },
  { email: 'test3@gmail.com', name: 'test mandal' },
  { email: 'test4@gmail.com', name: 'test mandal' },
  { email: 'test5@gmail.com', name: 'test mandal' },
  { email: 'test6@gmail.com', name: 'test mandal' },
  { email: 'test7@gmail.com', name: 'test mandal' },
  { email: 'test8@gmail.com', name: 'test mandal' },
  { email: 'test9@gmail.com', name: 'test mandal' },
  { email: 'test10@gmail.com', name: 'test mandal' },
  { email: 'test11@gmail.com', name: 'test mandal' },
  { email: 'test12@gmail.com', name: 'test mandal' },
  { email: 'test13@gmail.com', name: 'test mandal' },
  { email: 'test14@gmail.com', name: 'test mandal' },
];

export const Newsletter = () => {
  // newsletter emails
  const [newsletterEmails, setNewsletterEmails] = useState<NewsletterData[]>([]);
  // selected emails
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(
      asyncHandler(async () => {
        setNewsletterEmails(data);
        setIsLoading(false);
      }),
      1000
    );
  }, []);

  const renderTable = () =>
    newsletterEmails.length > 0 ? (
      //  emails table
      <table className='w-full px-4 py-2 z-10 bg-slate-100 relative'>
        {/* table header */}
        <tr className='w-full sticky top-0 left-0 text-sm font-medium text-slate-600 bg-slate-300 flex items-center justify-between px-6 py-1.5 z-20'>
          {/* left container */}
          <td className='w-[5%]'>
            <Checkbox
              isChecked={selectedEmails.length === newsletterEmails.length}
              onChange={isChecked => {
                if (!isChecked) {
                  // handle select all
                  setSelectedEmails([]);
                  return;
                }

                // handle deselect all
                setSelectedEmails([...newsletterEmails.map(email => email.email)]);
              }}
            />{' '}
          </td>
          <td className='w-[5%]'>#</td>
          <td className='w-[30%] ml-1'>Name</td>
          <td className='w-[30%] ml-1'>Email</td>
          <td className='w-[30%] text-center'>Action </td>
        </tr>
        {newsletterEmails.map(({ email, name }, idx) => (
          <tr
            key={email + name}
            className='w-full flex items-center  justify-between px-6 even:bg-slate-200 py-1.5 hover:bg-slate-300/60 transition-all duration-150'
          >
            {/* left container */}
            <td className='w-[5%]'>
              <Checkbox
                isChecked={selectedEmails.includes(email)}
                onChange={isChecked => {
                  if (!isChecked) {
                    // unchecked, remove the email from the list
                    setSelectedEmails(prevEmails => prevEmails.filter(e => e !== email));
                    return;
                  }

                  // checked, add the email to the list
                  setSelectedEmails(prevEmails => [...prevEmails, email]);
                }}
              />
            </td>
            <td className='text-sm w-[5%]'>{idx + 1}.</td>
            <td className='text-sm ml-1 w-[30%]'>{name.replace(`\\`, '').trim()}</td>
            <td className='text-sm w-[30%]'>{email}</td>
            {/* right container */}
            <td className='text-sm w-[30%] flex items-center justify-between z-10 pl-8 pr-6'>
              <button
                className='text-sm border border-slate-300 rounded-md px-1.5 py-px cursor-pointer'
                onClick={() => {
                  console.log('Action btn clicked!!');
                }}
              >
                ✅
              </button>
              <button
                className='text-sm border border-slate-300 rounded-md px-1.5 py-px cursor-pointer'
                onClick={() => {
                  console.log('Action btn clicked!! 2');
                }}
              >
                ❌
              </button>
              <button className='text-sm border border-slate-300 rounded-md px-1.5 py-px cursor-pointer'>
                🗑️
              </button>
              <button className='text-sm border border-slate-300 rounded-md px-1.5 py-px cursor-pointer'>
                ❌ + 🗑️
              </button>
            </td>
          </tr>
        ))}
      </table>
    ) : (
      <div className='text-slate-800 mt-16 font-light'>
        📭 No Newsletter or mailing list emails found in your Inbox.
        <br />
        <p className='ml-2 mt-3 opacity-60 font-extralight text-sm'>
          {' '}
          Emails already unsubscribed by Fresh Inbox won't be visible here.
        </p>
      </div>
    );

  return (
    <div className='w-full h-full max-h-full'>
      <h2 className=' text-slate-700 text-center mb-[.4rem] font-light text-sm'>
        Fresh Inbox has identified <u id='newsletterTab-numNewsletterEmails'>{newsletterEmails.length}</u>{' '}
        emails as newsletters or as part of a mailing list.
      </h2>

      <hr className='h-px w-full bg-slate-400' />

      {/* table container */}
      <div className='h-full'>
        <div className='w-full h-[90%] flex justify-center items-start overflow-x-hidden overflow-y-auto'>
          {loading ? <Spinner /> : renderTable()}
        </div>

        {/* selected emails */}
        <div className='h-[10%] w-full bg-slate-200 flex justify-between items-center px-6 border-t border-slate-500/50'>
          {selectedEmails.length < 1 ? (
            // no email selected
            <span className='text-sm text-slate-600 font-extralight'>
              Please select emails to perform bulk actions
            </span>
          ) : (
            <>
              {/* email selected  */}
              <span className='text-sm text-slate-600 font-extralight'>
                {selectedEmails.length} {selectedEmails.length > 1 ? 'Emails' : 'Email'} selected
              </span>
              {/*  email action  */}
              <div className='w-[35%] '>
                <button className='border border-slate-300 rounded-md px-1.5 py-px cursor-pointer text-sm h-max mr-2.5 z-[150]'>
                  ✅
                </button>
                <button className='border border-slate-300 rounded-md px-1.5 py-px cursor-pointer text-sm h-max mr-2.5'>
                  ❌
                </button>
                <button className='border border-slate-300 rounded-md px-1.5 py-px cursor-pointer text-sm h-max mr-2.5'>
                  🗑️
                </button>
                <button className='border border-slate-300 rounded-md px-1.5 py-px cursor-pointer text-sm h-max'>
                  ❌ + 🗑️
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
