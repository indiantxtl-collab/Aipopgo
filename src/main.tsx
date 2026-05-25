import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('Script error')) {
    e.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message && e.reason.message.includes('WebSocket')) {
    e.preventDefault();
  }
  if (e.reason === 'WebSocket closed before the connection was established' || e.reason === 'WebSocket closed without opened.') {
     e.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
