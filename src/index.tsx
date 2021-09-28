import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { FabricBase } from '@fluentui/react';
import { CustomToaster } from './components/CustomToaster';
initializeIcons();

ReactDOM.render(
  <React.StrictMode>
        <FabricBase>
          <App />
          <CustomToaster />
        </FabricBase>
  </React.StrictMode>,
  document.getElementById('root')
);