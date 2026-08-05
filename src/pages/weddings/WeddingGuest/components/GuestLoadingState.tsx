import { FC } from 'react';
import { Spin } from 'antd';
import styles from './GuestStates.module.css';

export const GuestLoadingState: FC = () => (
  <div className={styles.loadingWrap}>
    <Spin size="large" />
  </div>
);
