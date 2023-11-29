import '@pages/popup/Popup.css';

const Popup = () => {
  return (
    <div className='flex relative items-center justify-center h-full w-full flex-col bg-emerald-100/25'>
      <div className='flex items-center -mt-2'>
        <img src='/icon-128.png' className='w-12 h-12 mr-2 mt-px' />
        <span className='text-2xl text-slate-800 font-medium'>Fresh Inbox</span>
      </div>
      <a
        className='mt-4 underline  text-slate-900 hover:font-medium transition-all duration-200'
        href='https://mail.google.com/mail/u/'
        target='_blank'
        rel='noopener noreferrer'
      >
        Open Gmail
      </a>
      <div className='absolute bottom-1.5 left-auto text-[.7rem] tracking-tight text-slate-700 font-light'>
        Consider leaving a review if FreshInbox is helpful.&nbsp;
        {/* TODO: update the review link */}
        <a
          className='underline'
          href='https://freshinbox.xyz/link/chrome'
          target='_blank'
          rel='noopener noreferrer'
        >
          here
        </a>
      </div>
    </div>
  );
};

export default Popup;
