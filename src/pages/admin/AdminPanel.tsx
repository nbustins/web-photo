import { FC, useCallback, useEffect, useState } from 'react';
import { ConfigProvider, Drawer, Layout, Menu } from 'antd';
import type { ThemeConfig } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import { semantic } from '@styles/tokens';
import { logout } from '../../services/auth/auth.service';
import { fetchBookings } from '../../services/booking/booking.admin.api';
import { AdminIcons } from './icons';
import type { AdminShellContext } from './adminShell';
import styles from './AdminPanel.module.css';

const SECTIONS = [
  { key: 'bookings', label: 'Reserves', icon: AdminIcons.calendar },
  { key: 'sessions', label: 'Sessions', icon: AdminIcons.sessions },
  { key: 'schedule', label: 'Horaris', icon: AdminIcons.schedule },
  { key: 'blocked', label: 'Dies bloquejats', icon: AdminIcons.block },
  { key: 'weddings', label: 'Casaments', icon: AdminIcons.weddings },
];

// The sidebar menu sits on the olive brand surface. antd needs parseable colours here (see
// antd-theme.ts), so these are literal white alphas rather than var(--lt-*).
const menuTheme: ThemeConfig = {
  components: {
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemColor: 'rgba(255, 255, 255, 0.72)',
      darkItemHoverColor: semantic.colorTextOnBrand,
      darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
      darkItemSelectedColor: semantic.colorTextOnBrand,
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.14)',
      itemHeight: 44,
      itemBorderRadius: 8,
      itemMarginInline: 0,
      iconSize: 17,
    },
  },
};

export const AdminPanel: FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState(0);

  // Requests waiting for review: the one number worth seeing from any section. A failure only
  // hides the badge; the bookings section reports its own load errors.
  const refreshPending = useCallback(() => {
    fetchBookings({ status: 'Requested' })
      .then((list) => setPending(list.length))
      .catch(() => setPending(0));
  }, []);

  useEffect(refreshPending, [refreshPending]);

  const active = pathname.split('/')[2] ?? 'bookings';

  const go = (key: string) => {
    setMenuOpen(false);
    if (key === 'logout') {
      logout();
      navigate('/admin/login', { replace: true });
      return;
    }
    navigate(`/admin/${key}`);
  };

  const nav = (
    <ConfigProvider theme={menuTheme}>
      <nav className={styles.nav} aria-label="Seccions">
        <div className={styles.brand}>
          <span className={styles.brandTitle}>Gestió</span>
          <span className={styles.brandCaption}>Panell d'administració</span>
        </div>
        <Menu
          mode="inline"
          theme="dark"
          className={styles.menu}
          selectedKeys={[active]}
          onClick={({ key }) => go(key)}
          items={SECTIONS.map(({ key, label, icon: Icon }) => ({
            key,
            icon: <Icon />,
            label: key === 'bookings' && pending > 0 ? (
              <span className={styles.menuLabel}>
                {label}
                <span className={styles.pendingBadge} aria-label={`${pending} pendents`}>{pending}</span>
              </span>
            ) : label,
          }))}
        />
        <Menu
          mode="inline"
          theme="dark"
          selectable={false}
          className={`${styles.menu} ${styles.menuFooter}`}
          onClick={() => go('logout')}
          items={[{ key: 'logout', icon: <AdminIcons.logout />, label: 'Sortir' }]}
        />
      </nav>
    </ConfigProvider>
  );

  const shell: AdminShellContext = { openMenu: () => setMenuOpen(true), refreshPending };

  return (
    <Layout className={styles.layout} hasSider={!isMobile}>
      {isMobile ? (
        <Drawer
          placement="left"
          width={260}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          closable={false}
          classNames={{ body: styles.drawerBody }}
        >
          {nav}
        </Drawer>
      ) : (
        <Layout.Sider width={232} className={styles.sider}>
          {nav}
        </Layout.Sider>
      )}
      <Layout className={styles.main}>
        <Outlet context={shell} />
      </Layout>
    </Layout>
  );
};
