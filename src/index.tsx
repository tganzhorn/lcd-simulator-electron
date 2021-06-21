import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ToastProvider } from 'react-toast-notifications';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { FabricBase } from '@fluentui/react';
initializeIcons();

ReactDOM.render(
  <React.StrictMode>
      <ToastProvider placement="bottom-center">
        <FabricBase>
          <App />
        </FabricBase>
      </ToastProvider>
  </React.StrictMode>,
  document.getElementById('root')
);