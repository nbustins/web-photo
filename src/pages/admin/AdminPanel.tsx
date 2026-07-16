import { FC } from 'react';
import { Button, Layout, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth/auth.service';
import { BookingsTab } from './tabs/BookingsTab';
import { SessionsTab } from './tabs/SessionsTab';
import { ScheduleTab } from './tabs/ScheduleTab';

const { Header, Content } = Layout;

export const AdminPanel: FC = () => {
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'rgb(246, 244, 240)' }}>
      <Header style={{
        background: '#5C5440',
        height: 'auto',
        lineHeight: 'normal',
        padding: 0,
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: "'Italiana', Georgia, serif",
            fontSize: 26,
            fontWeight: 400,
            color: '#fff',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
          }}>
            Gestió de reserves
          </span>
          <Button
            ghost
            onClick={onLogout}
            style={{
              borderColor: 'rgba(255, 255, 255, 0.55)',
              color: 'rgba(255, 255, 255, 0.9)',
              letterSpacing: '0.06em',
            }}
          >
            Sortir
          </Button>
        </div>
      </Header>
      <Content style={{ padding: 24, maxWidth: 1200, width: '100%', margin: '0 auto' }}>
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
