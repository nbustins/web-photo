import React from 'react';
import { AppRouter } from './router/AppRouter';
import { ConfigProvider } from 'antd';
import caES from 'antd/locale/ca_ES';
import dayjs from 'dayjs';
import 'dayjs/locale/ca';
import { antdTheme } from './styles/antd-theme';

dayjs.locale('ca');

const App: React.FC = () => {
  return (
    <ConfigProvider theme={antdTheme} locale={caES}>
      <AppRouter />
    </ConfigProvider>
  );
};

export default App;
