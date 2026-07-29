import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { register as registerSW } from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA / offline support
registerSW({
  onSuccess: () => console.log('[Collarix] App ready for offline use.'),
  onUpdate: () => console.log('[Collarix] New version available – reload to update.'),
});

reportWebVitals();
