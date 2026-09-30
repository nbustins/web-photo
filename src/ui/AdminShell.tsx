import { FC, useState } from 'react';
import { ConfigProvider, Drawer, Layout, Menu } from 'antd';
import type { ThemeConfig } from 'antd';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@ui/hooks/useIsMobile';
import { semantic } from '@styles/tokens';
import { Icons, IconName } from './icons';
import type { ShellContext } from './shellContext';
import styles from './AdminShell.module.css';

export interface ShellItem {
  key: string;
  label: string;
  icon: IconName;
  /** Count shown beside the label when above zero. */
  badge?: number;
}

interface AdminShellProps {
  brandTitle: string;
  brandCaption: string;
  items: ShellItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  onLogout: () => void;
  logoutLabel?: string;
  /** Merged with { openMenu } and handed to the sections through <Outlet context>. */
  outletContext?: object;
}

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

/**
 * Sidebar (desktop) / drawer (mobile) shell around routed sections. Domain-free: the consumer
 * supplies the brand, the nav items and what selecting or leaving does.
 */
export const AdminShell: FC<AdminShellProps> = ({
  brandTitle,
  brandCaption,
  items,
  activeKey,
  onSelect,
  onLogout,
  logoutLabel = 'Sortir',
  outletContext,
}) => {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (key: string) => {
    setMenuOpen(false);
    onSelect(key);
  };

  const leave = () => {
    setMenuOpen(false);
    onLogout();
  };

  const nav = (
    <ConfigProvider theme={menuTheme}>
      <nav className={styles.nav} aria-label="Seccions">
        <div className={styles.brand}>
          <span className={styles.brandTitle}>{brandTitle}</span>
          <span className={styles.brandCaption}>{brandCaption}</span>
        </div>
        <Menu
          mode="inline"
          theme="dark"
          className={styles.menu}
          selectedKeys={[activeKey]}
          onClick={({ key }) => go(key)}
          items={items.map(({ key, label, icon, badge }) => {
            const Icon = Icons[icon];
            return {
              key,
              icon: <Icon />,
              label: badge && badge > 0 ? (
                <span className={styles.menuLabel}>
                  {label}
                  <span className={styles.badge} aria-label={`${badge} pendents`}>{badge}</span>
                </span>
              ) : label,
            };
          })}
        />
        <Menu
          mode="inline"
          theme="dark"
          selectable={false}
          className={`${styles.menu} ${styles.menuFooter}`}
          onClick={leave}
          items={[{ key: 'logout', icon: <Icons.logout />, label: logoutLabel }]}
        />
      </nav>
    </ConfigProvider>
  );

  const context: ShellContext = { ...outletContext, openMenu: () => setMenuOpen(true) };

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
        <Outlet context={context} />
      </Layout>
    </Layout>
  );
};
