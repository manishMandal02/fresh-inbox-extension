import { useEffect, useState } from 'react';
import { Tabs } from '../../elements/Tabs';

const tabs = ['General', 'Search', 'Newsletter', 'Unsubscribed', 'Whitelisted'] as const;

export type Tabs = (typeof tabs)[number];

export default function App() {
  //
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tabs>('General');

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

  return (
    <>
      <button
        className='text-slate-50 bg-brand-primary py-1.5 px-2 rounded-md text-sm cursor-pointer '
        onClick={handleOpenSettings}
      >
        ✉️ Fresh Inbox
      </button>
      {/* Modal */}
      {isModalOpen ? (
        <div className='fixed top-0 left-0 w-screen h-screen flex items-center justify-center'>
          {/* backdrop */}
          <div
            className='fixed w-screen h-screen bg-slate-500 bg-opacity-50 transition-opacity z-10'
            onClick={handleCloseModal}
          ></div>
          {/* modal card */}
          <div className='w-[60%] h-4/6 rounded-md shadow-lg z-50 shadow-slate-600 bg-slate-100'>
            <Tabs tabs={[...tabs]} activeTab={activeTab} setActiveTab={setActiveTab}>
              Body
            </Tabs>
          </div>
        </div>
      ) : null}
    </>
  );
}
