import { useState } from 'react';
import { IMessageEvent, type IMessageBody } from '../../types/content.types';
import { embedAssistantBtn } from '../assistant-button';
import { disableApp } from '../../utils/disableApp';

type Props = {
  isAppEnabled: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
};

const AuthCard = ({ isAppEnabled, onClose, onAuthSuccess }: Props) => {
  const [errorMsg, setErrorMsg] = useState('');

  // handle connect button click
  const handleConnectBtnClick = async () => {
    // get client id from evn variables
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const res = await chrome.runtime.sendMessage<IMessageBody>({
      clientId,
      event: IMessageEvent.LAUNCH_AUTH_FLOW,
      userEmail: freshInboxGlobalVariables.userEmail,
    });
    if (res) {
      // auth success

      // close the modal
      onClose();

      // embed assistant button
      await embedAssistantBtn();
      // sets auth state in app modal
      onAuthSuccess();

      // run checks after successful auth
      await chrome.runtime.sendMessage<IMessageBody>({
        event: IMessageEvent.CHECKS_AFTER_AUTH,
      });
    } else {
      // failed auth
      // show error message
      setErrorMsg('❌ Failed to connect Fresh Inbox to your Gmail, Please try again.');
    }
  };

  // handle disable button click

  const handleDisableBtnClick = async () => {
    await disableApp();
  };

  return (
    <>
      <div className='max-w-full h-[10%] relative flex items-center justify-between bg-slate-800 rounded-tr-md rounded-tl-md px-4  '>
        <span className='font-extralight tracking-wide text-slate-100'>Connect FreshInbox to your Gmail</span>
        <button
          className='text-2xl text-slate-100 font-extralight bg-transparent outline-none border-none cursor-pointer hover:opacity-80 transition-opacity duration-200 select-none'
          onClick={onClose}
        >
          X
        </button>
      </div>
      <div className='h-[90%] relative'>
        {/* features container */}
        <div className='text-slate-900 font-light leading-8  p-8 bg-emerald-100/50 rounded-sm'>
          ✉️ Fresh Inbox makes keeping your Gmail inbox clean and clutter-free a breeze. <br />
          🧹 Unsubscribe from unwanted newsletters and mailing lists, <br />
          🗑️ Delete hundreds of emails with just a single click. <br />
          🔐 No data leaves your browser, everything happens in your own browser. You're in complete control.
          <br />
          <p className='m-0 mt-2.5'>
            🎬 Want to learn more? Check out our quick walkthrough here:{' '}
            <a
              className='underline'
              href='https://www.youtube.com/watch?v=testvideo'
              target='_blank'
              rel='noreferrer'
            >
              Link
            </a>
          </p>
        </div>
        {/* bottom container */}
        <div className='mt-6 flex flex-col items-center  '>
          {/* connect to gmail */}
          <div className='flex flex-col items-center justify-center'>
            <span className=' text-slate-700 text-[1.3rem] font-light mb-5'>
              Allow FreshInbox to access your Gmail securely
            </span>

            <button
              className='px-10 py-2.5 w-fit border-none rounded-sm bg-brand-primary text-base text-slate-50  hover:bg-brand-primary/90 transition-all duration-200 cursor-pointer'
              onClick={handleConnectBtnClick}
            >
              Connect to Gmail
            </button>
            <span className='mt-3 text-slate-500 font-light text-[0.7rem] leading-5'>
              FreshInbox runs completely in your browser, no data leaves your browser.
            </span>
            {/* auth error message */}
            {errorMsg && (
              <span className='mt-2.5 text-sm font-light text-red-500 opacity-70'>{errorMsg}</span>
            )}
          </div>
          {/* disable app button */}
          <button
            className='absolute bottom-4 text-sm text-slate-500 underline border-none outline-none bg-transparent cursor-pointer'
            onClick={handleDisableBtnClick}
          >
            {!isAppEnabled ? 'Fresh Inbox is currently disabled' : 'Disable Fresh Inbox'}
          </button>
        </div>
      </div>
    </>
  );
};

export default AuthCard;
