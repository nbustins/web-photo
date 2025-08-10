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
            fontFamily:"Sour Gummy"
          },
        }}
      >
    <AppRouter />
    </ConfigProvider>);
};

export default App;
