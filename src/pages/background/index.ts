import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
console.log('🔥 background loaded');

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('🔥 background loaded');

// check for dev/prod env

// chrome.management.get(chrome.runtime.id, function (extensionInfo) {
//     if (extensionInfo.installType === 'development') {
//       // perform dev mode action here
//     }
// });
