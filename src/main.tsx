import React from 'react';
import ReactDOM from 'react-dom/client';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './styles/industrial-theme.css';
import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No se encontró el nodo raíz #root en index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
