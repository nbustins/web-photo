import { FC } from 'react';
import { Button, Layout, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AppBar } from '@ui/AppBar';
import { logout } from '../../services/auth/auth.service';
import { BookingsTab } from './tabs/BookingsTab';
import { SessionsTab } from './tabs/SessionsTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import styles from './AdminPanel.module.css';

const { Content } = Layout;

export const AdminPanel: FC = () => {
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <Layout className={styles.layout}>
      <AppBar
        title="Gestió de reserves"
        actions={
          <Button ghost onClick={onLogout} className={styles.logoutButton}>
            Sortir
          </Button>
        }
      />
      <Content className={styles.content}>
        <Tabs
          defaultActiveKey="bookings"
          destroyInactiveTabPane
          items={[
            { key: 'bookings', label: 'Reserves', children: <BookingsTab /> },
            { key: 'sessions', label: 'Sessions', children: <SessionsTab /> },
            { key: 'schedule', label: 'Horaris', children: <ScheduleTab /> },
          ]}
        />
      </Content>
    </Layout>
  );
};
