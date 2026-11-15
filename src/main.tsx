import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AppState } from './state';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppState>
      <HashRouter>
        <App />
      </HashRouter>
    </AppState>
  </StrictMode>,
);
