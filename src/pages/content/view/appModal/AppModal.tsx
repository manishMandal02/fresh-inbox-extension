import { use, useEffect, useState } from 'react';
import { Tabs } from '../elements/Tabs';
import { General } from './tabs/General';
import { Newsletter } from './tabs/Newsletter';
import AuthCard from './AuthCard';
import Unsubscribed from './tabs/Unsubscribed';
import Whitelisted from './tabs/Whitelisted';

const tabs = ['General', 'Search', 'Newsletter', 'Unsubscribed', 'Whitelisted'] as const;

export type Tabs = (typeof tabs)[number];

type Props = {
  isAppEnabled: boolean;
  isTokenValid: boolean;
};

const AppModal = ({ isAppEnabled, isTokenValid }: Props) => {
  //
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tabs>('Newsletter');

  useEffect(() => {
    if (isAppEnabled && !isTokenValid) {
      setIsModalOpen(true);
    }
  }, [isAppEnabled, isTokenValid]);

  useEffect(() => {
    setIsAuthed(isTokenValid);
  }, [isTokenValid]);

  const handleOpenSettings = () => {
    console.log('🚀 ~ file: App.tsx:14 ~ handleOpenSettings ~ handleOpenSettings: 🔥');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const renderActiveTab = (activeTab: string) => {
    switch (activeTab) {
      case 'General':
        return <General />;
      case 'Search':
        return <div>Search</div>;
      case 'Newsletter':
        return <Newsletter />;
      case 'Unsubscribed':
        return <Unsubscribed />;
      case 'Whitelisted':
        return <Whitelisted />;
      default:
        return <General />;
    }
  };

  return (
    <>
      <button
        className={`text-slate-50  py-1.5 px-2 rounded-md text-sm cursor-pointer  
        ${isAppEnabled ? 'bg-brand-primary' : 'bg-slate-500'}
        `}
        onClick={handleOpenSettings}
      >
        ✉️ Fresh Inbox
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
          <div className='w-[60%] h-4/6 rounded-md shadow-lg z-50 shadow-slate-600 bg-slate-100'>
            {isAppEnabled && isTokenValid ? (
              // {/* all tabs */}
              <Tabs tabs={[...tabs]} activeTab={activeTab} setActiveTab={setActiveTab}>
                {renderActiveTab(activeTab)}
              </Tabs>
            ) : (
              // {/* auth card */}
              <AuthCard
                isAppEnabled={isAppEnabled}
                onClose={() => {
                  setIsModalOpen(false);
                }}
                onAuthSuccess={() => setIsAuthed(true)}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AppModal;
