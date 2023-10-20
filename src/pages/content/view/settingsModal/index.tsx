import { createRoot } from 'react-dom/client';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';

import SettingsModal from './SettingsModal';

import '../../style.scss';

refreshOnUpdate('pages/content');

const root = document.createElement('div');
root.id = 'fresh-inbox-react-root';
document.body.append(root);

root.style.position = 'fixed';
root.style.zIndex = '10000';
root.style.top = '20px';
root.style.right = '200px';

createRoot(root).render(<SettingsModal />);
