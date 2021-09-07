import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import toast, { resolveValue, Toaster } from 'react-hot-toast';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { AnimationStyles, FabricBase, mergeStyles, MessageBar, MessageBarType } from '@fluentui/react';
initializeIcons();

ReactDOM.render(
  <React.StrictMode>
        <FabricBase>
          <App />
          <Toaster position="bottom-center" gutter={0}  containerStyle={{padding: 0, inset: 0}} toastOptions={{
            success: {
              duration: 2000
            },
            error: {
              duration: 5000,
            }
          }}
          >
            {(t) => {
              const types = {
                "error": MessageBarType.error,
                "success": MessageBarType.success,
                "loading": MessageBarType.blocked,
                "blank": MessageBarType.info,
                "custom": MessageBarType.info
              };
              return (
                <MessageBar 
                key={t.id} 
                messageBarType={types[t.type]} 
                className={mergeStyles(t.visible ? AnimationStyles.scaleUpIn100 : AnimationStyles.scaleUpOut103)}
                dismissButtonAriaLabel="Close"
                onDismiss={() => toast.dismiss(t.id)}
                >
                  {resolveValue(t.message, t)}
                </MessageBar>
              )
            }}
          </Toaster>
        </FabricBase>
  </React.StrictMode>,
  document.getElementById('root')
);