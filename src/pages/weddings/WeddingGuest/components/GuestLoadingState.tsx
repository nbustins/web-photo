import { FC } from 'react';
import { Spin } from 'antd';

export const GuestLoadingState: FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 300,
    }}>
      <Spin size="large" />
    </div>
  );
};
