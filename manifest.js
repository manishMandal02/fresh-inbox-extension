import packageJson from './package.json' assert { type: 'json' };

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */

const manifest = {
  manifest_version: 3,
  name: 'Fresh Inbox: Clean Gmail with Total Privacy',
  version: '1.0.0',
  description: 'Your go-to Chrome extension for a clutter-free Gmail experience.',
  background: {
    service_worker: 'src/pages/background/index.js',
    type: 'module',
  },
  permissions: ['identity', 'storage'],
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: 'icon-128.png',
    default_title: 'Fresh Inbox',
  },
  icons: {
    128: 'icon-128.png',
  },
  content_scripts: [
    {
      matches: ['https://mail.google.com/mail/*'],
      js: ['src/pages/content/index.js'],
      // KEY for cache invalidation
      css: ['assets/css/contentStyle<KEY>.chunk.css'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['assets/js/*.js', 'assets/css/*.css', 'icon-128.png', 'icon-34.png'],
      matches: ['*://*/*'],
    },
  ],

  key: `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlIk1KHdRO+3lMZbmpfvh3SiaXWNxd/PtJ0xuk96y22h2bghTREnAydg5YGi9VmgyE0ipDrO6PfPemIXVNtpxCdpErjw1h+MVQOoDRrdfMijuZEg+CEgKxi3r6DPgKDwxtPhOZ5A63+yz55XvJmfaA4PbaYNx16v0WRhO71PeK2ftLBbt2dSE7BbpoKYDlVG+n9AFxg+y0fNqUmAJph+Kk//5t6Uf1OcR2w+ajDFczP3P+BGuYeUUg3NqvirVkHRn6LRynaQqNzZ70Hhoc1sWuGZG4I4yzF1C+33zkqgiAwuRt9dQk4rPa4CIdaQxZxt2aKX177fKDwqMuMa3ZIgAiwIDAQAB`,
};

export default manifest;
