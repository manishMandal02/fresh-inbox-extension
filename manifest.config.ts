import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Fresh Inbox',
  version: '2.0.0',
  description: 'Clean Inbox, Total Privacy.',
  permissions: ['storage', 'activeTab'],
  action: {
    default_title: 'Fresh Inbox',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://mail.google.com/*'],
      js: ['src/content/index.ts'],
    },
  ],
  icons: {
    128: 'public/icon-128.png',
  },
});