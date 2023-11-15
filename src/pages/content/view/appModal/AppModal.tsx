import { useEffect, useState } from 'react';
import { Tabs } from '../elements/Tabs';
import { General } from './tabs/General';
import { Newsletter } from './tabs/Newsletter';
import AuthCard from './AuthCard';
import Unsubscribed from './tabs/Unsubscribed';
import Whitelisted from './tabs/Whitelisted';
import AdvanceSearch from './tabs/advance-search';

import FreshInboxIcon from './../../assets/app-icon-128.png';

const tabs = ['General', 'Newsletter', 'Unsubscribed', 'Whitelisted', 'Advance Search'] as const;

export type Tabs = (typeof tabs)[number];

type Props = {
  isAppEnabled: boolean;
  isTokenValid: boolean;
};

const AppModal = ({ isAppEnabled, isTokenValid }: Props) => {
  //
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tabs>('General');

  //TODO: - gmail api limit exceeded

  useEffect(() => {
    if (isAppEnabled && !isTokenValid) {
      setIsModalOpen(true);
    }
  }, [isAppEnabled, isTokenValid]);

  const handleOpenSettings = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const renderActiveTab = (currentTab: Tabs) => {
    switch (currentTab) {
      case 'General':
        return <General />;
      case 'Newsletter':
        return <Newsletter />;
      case 'Unsubscribed':
        return <Unsubscribed />;
      case 'Whitelisted':
        return <Whitelisted />;
      case 'Advance Search':
        return <AdvanceSearch />;
      default:
        return <General />;
    }
  };

  return (
    <>
      <button
        className={` bg-transparent py-1.5 px-2 rounded text-sm  flex items-center justify-center cursor-pointer appearance-none outline-none border
         border-slate-50  border-opacity-20 hover:border-opacity-50 hover:border-slate-600 focus:border-opacity-50 
        ${isAppEnabled ? ' text-white' : 'text-slate-500 grayscale'}
        `}
        onClick={handleOpenSettings}
      >
        <img src={FreshInboxIcon} alt='icon' className='w-5 h-5 mr-1.5 ' /> Fresh Inbox
      </button>
      {/* Modal */}
      {isModalOpen ? (
        <div className='fixed top-0 left-0 w-screen h-screen flex items-center justify-center'>
          {/* backdrop */}
          <div
            className='absolute w-full h-full bg-slate-800 bg-opacity-70 transition-opacity z-10'
            onClick={handleCloseModal}
          ></div>
          {/* modal card */}
          <div className='w-[65rem] h-[40rem] rounded-md shadow-lg z-50 shadow-slate-600 bg-slate-100'>
            {isAppEnabled && isTokenValid ? (
              // {/* all tabs */}
              <Tabs tabs={[...tabs]} activeTab={activeTab} setActiveTab={setActiveTab}>
                {renderActiveTab(activeTab)}
              </Tabs>
            ) : isAppEnabled && !isTokenValid ? (
              // {/* auth card */}
              <AuthCard
                isAppEnabled={isAppEnabled}
                onClose={() => {
                  setIsModalOpen(false);
                }}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AppModal;
