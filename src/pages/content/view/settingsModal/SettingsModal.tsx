import { useEffect, useState } from 'react';
import { Tabs } from '../elements/Tabs';
import { General } from './tabs/General';
import { Newsletter } from './tabs/Newsletter';

const tabs = ['General', 'Search', 'Newsletter', 'Unsubscribed', 'Whitelisted'] as const;

export type Tabs = (typeof tabs)[number];

type Props = {
  isAppEnabled: boolean;
};

const SettingsModal = ({ isAppEnabled }: Props) => {
  //
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tabs>('Newsletter');

  useEffect(() => {
    console.log('React view loaded');
  }, []);

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
        return <div>Unsubscribed</div>;
      case 'Whitelisted':
        return <div>Whitelisted</div>;
      default:
        return <div>General</div>;
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
      {/* // TODO: show auth modal if the app is disabled when settings btn is clicked */}
      {isModalOpen ? (
        <div className='fixed top-0 left-0 w-screen h-screen flex items-center justify-center'>
          {/* backdrop */}
          <div
            className='absolute w-full h-full bg-slate-800 bg-opacity-70 transition-opacity z-10'
            onClick={handleCloseModal}
          ></div>
          {/* modal card */}
          <div className='w-[60%] h-4/6 rounded-md shadow-lg z-50 shadow-slate-600 bg-slate-100'>
            <Tabs tabs={[...tabs]} activeTab={activeTab} setActiveTab={setActiveTab}>
              {renderActiveTab(activeTab)}
            </Tabs>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default SettingsModal;
