import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/index.css';
import App from './App';

import { ThemeProvider } from '@/components/theme-provider';

// Render immediately for optimal Speed Index
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}
