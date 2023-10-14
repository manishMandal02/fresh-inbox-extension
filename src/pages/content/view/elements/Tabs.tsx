import type { Dispatch, SetStateAction } from 'react';

type Props = {
  tabs: string[];
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
};

export const Tabs = ({ tabs, activeTab, setActiveTab }: Props) => {
  const isActive = tab => tab === activeTab;
  return (
    <div className='w-full h-full'>
      {/* tabs */}
      <div className='w-full h-[10%] flex items-center justify-between px-10 py-2 bg-slate-800 rounded-tr-md rounded-tl-md'>
        {tabs.map(tab => (
          <span
            key={tab}
            className={`w-min text-slate-200 transition-all duration-200 ${
              isActive(tab) ? `bg-brand-primary text-slate-800` : ``
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* tab content */}
      <div className='w-full h-[90%] flex flex-col items-center justify-center p-10 bg-slate-300'>
        Tab body
      </div>
    </div>
  );
};
