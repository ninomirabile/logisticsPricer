import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import i18n from './locales'; // Initialize i18n

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Wait for i18n to be ready before rendering
i18n.on('initialized', () => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

// Fallback in case i18n is already initialized
if (i18n.isInitialized) {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} 