import React, { useState } from 'react';

type NewsletterData = {
  email: string;
  name: string;
};

export const Newsletter = () => {
  // newsletter emails
  const [newsletterEmails, setNewsletterEmails] = useState<NewsletterData[]>([]);
  return (
    <div className='w-full h-full '>
      <h2 className=' text-slate-700 text-center mb-[.4rem]'>
        Fresh Inbox has identified <u id='newsletterTab-numNewsletterEmails'>{newsletterEmails.length}</u>{' '}
        emails as newsletters or as part of a mailing list.
      </h2>

      <hr className='h-px w-full bg-slate-400' />

      <div className='w-full h-full flex justify-center items-start'>
        {newsletterEmails.length > 0 ? (
          <table>
            {/* emails table */}
            {newsletterEmails.map(({ email, name }, idx) => (
              <td key={email + name}>
                <span>
                  <strong>${idx + 1}.</strong> <span>${name.replace(`\\`, '').trim()}</span>(${email})
                </span>
                <div>
                  <button>✅</button>
                  <button>❌</button>
                  <button>🗑️</button>
                  <button>❌ + 🗑️</button>
                </div>
              </td>
            ))}
          </table>
        ) : (
          <p className='text-slate-800 mt-16'>
            {' 📭 No Newsletter or mailing list emails found in your Inbox.'}
            <br />
            <span className='mt-16'>
              ℹ️ Emails already unsubscribed by Fresh Inbox won't be visible here.
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
