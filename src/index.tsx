import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ToastProvider } from 'react-toast-notifications';

ReactDOM.render(
  <React.StrictMode>
    <ToastProvider placement="bottom-center">
      <App />
    </ToastProvider>
  </React.StrictMode>,
  document.getElementById('root')
);