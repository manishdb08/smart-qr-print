import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { PrintSystemProvider } from './context/PrintSystemContext';
import './index.css';
import './portal.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PrintSystemProvider>
      <App />
    </PrintSystemProvider>
  </React.StrictMode>
);
