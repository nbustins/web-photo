import React from 'react';
import { AppRouter } from './router/AppRouter';
import { ConfigProvider } from 'antd';
import { antdTheme } from './styles/antd-theme';

const App: React.FC = () => {
  return (
    <ConfigProvider theme={antdTheme}>
      <AppRouter />
    </ConfigProvider>
  );
};

export default App;
