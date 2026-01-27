import React from 'react';
import { AppRouter } from './router/AppRouter';
import { ConfigProvider } from 'antd';

const App: React.FC = () => {
  return (
    <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#7C7458', // Primary blue color
            colorLink: '#1890ff',    // Link color
            colorText: '#333',       // Text color
            fontFamily:"Raleway"
          },
          components: {
            Button: {
              paddingInline: 22,
              controlHeight: 40,
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 600,
              //letterSpacing: 0.5,
              primaryShadow: "0 10px 22px rgba(0,0,0,0.12)",
            },
          },
        }}
      >
    <AppRouter />
    </ConfigProvider>);
};

export default App;
