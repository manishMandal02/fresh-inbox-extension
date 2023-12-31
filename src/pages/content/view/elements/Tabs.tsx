import type { Dispatch, ReactNode, SetStateAction } from 'react';

type Props = {
  tabs: string[];
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  children: ReactNode;
};

export const Tabs = ({ tabs, activeTab, setActiveTab, children }: Props) => {
  // active class
  const isActive = (tab: string) => (tab === activeTab ? 'bg-slate-700 bg-opacity-60' : null);

  //

  return (
    <div className='max-w-full h-full'>
      {/* tabs */}
      <div className='w-full h-[8%] relative flex items-start justify-between bg-slate-800 rounded-tr-md rounded-tl-md p-0 select-none'>
        {tabs.map(tab => (
          <span
            key={tab}
            className={` text-slate-50 transition-all w-full h-full flex font-light tracking-wide justify-center items-center duration-200  rounded-md cursor-pointer 
            hover:bg-slate-700 hover:bg-opacity-60 hover:text-slate-100 
             ${isActive(tab)} 
             `}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </span>
        ))}
        {/* active tab indicator */}
        <div
          className='w-1/5 h-[10%] bg-brand-primary  absolute bottom-0 z-[100] transition-transform duration-200'
          style={{ transform: `translateX(${tabs.indexOf(activeTab) * 100}%)` }}
        ></div>
      </div>

      {/* tab content */}
      <div className='max-w-full h-[92%] flex flex-col py-2 bg-slate-100'>{children}</div>
    </div>
  );
};
